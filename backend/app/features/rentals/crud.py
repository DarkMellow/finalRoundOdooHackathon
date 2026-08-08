from datetime import date, datetime, timezone
from decimal import Decimal
from typing import List, Optional
from sqlmodel import Session, select
from fastapi import HTTPException, status

from app.features.products.models import Product
from app.features.rentals.models import Rental, DepositLedgerEntry
from app.features.rentals.schemas import RentalCreate

def calculate_rental_settlement(
    due_date: date,
    actual_return_date: date,
    daily_rate: Decimal,
    deposit_collected: Decimal
) -> dict:
    """
    Core late-fee logic according to TRD.md Section 4.3.
    """
    if actual_return_date <= due_date:
        days_late = 0
        late_fee = Decimal("0.00")
        refund_amount = deposit_collected
    else:
        days_late = (actual_return_date - due_date).days
        late_fee = Decimal(days_late) * daily_rate
        # Enforce deposit cap
        late_fee = min(late_fee, deposit_collected)
        refund_amount = deposit_collected - late_fee

    return {
        "days_late": days_late,
        "late_fee_charged": late_fee,
        "deposit_refunded": refund_amount
    }

def get_rental(session: Session, rental_id: int) -> Optional[Rental]:
    """
    Retrieve a rental by ID.
    """
    return session.get(Rental, rental_id)

def list_rentals(session: Session, status_filter: Optional[str] = None) -> List[Rental]:
    """
    Retrieve rentals with optional filter.
    """
    statement = select(Rental)
    
    # Filter parsing
    if status_filter == "Active":
        statement = statement.where(Rental.actual_return_date == None)
    elif status_filter == "Completed":
        statement = statement.where(Rental.actual_return_date != None)
    elif status_filter == "Overdue":
        statement = statement.where(
            Rental.actual_return_date == None
        ).where(
            Rental.due_date < date.today()
        )
        
    return session.exec(statement).all()

def execute_create_rental(session: Session, rental_data: RentalCreate) -> Rental:
    """
    Create a new rental record utilizing pessimistic locking to avoid inventory race conditions.
    """
    # Verify rental dates logic
    if rental_data.due_date < rental_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Due date cannot be before start date."
        )

    # Pessimistic row locking on Product catalog
    product = session.exec(
        select(Product)
        .where(Product.id == rental_data.product_id)
        .with_for_update()
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Product not found"
        )
        
    if product.quantity_available <= 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product is currently out of stock."
        )
        
    # Decrement available catalog item
    product.quantity_available -= 1
    session.add(product)
    
    # Create Rental Record
    new_rental = Rental(
        product_id=product.id,
        customer_name=rental_data.customer_name,
        customer_phone=rental_data.customer_phone,
        start_date=rental_data.start_date,
        due_date=rental_data.due_date,
        deposit_amount=rental_data.deposit_amount,
    )
    session.add(new_rental)
    session.flush()  # Populates new_rental.id
    
    # Create Deposit Log Entry
    entry = DepositLedgerEntry(
        rental_id=new_rental.id,
        entry_type="COLLECTED",
        amount=new_rental.deposit_amount
    )
    session.add(entry)
    
    session.commit()
    session.refresh(new_rental)
    return new_rental

def execute_rental_return(session: Session, rental_id: int, actual_return_date: date) -> Rental:
    """
    Process returns and settle deposit using atomic transactions.
    """
    # 1. Lock rental row
    rental = session.exec(
        select(Rental)
        .where(Rental.id == rental_id)
        .with_for_update()
    ).first()
    
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Rental not found"
        )
        
    if rental.actual_return_date is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rental has already been returned and settled."
        )
        
    if actual_return_date < rental.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Actual return date cannot be prior to start date."
        )
        
    # 2. Lock product row to safely increment availability
    product = session.exec(
        select(Product)
        .where(Product.id == rental.product_id)
        .with_for_update()
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Associated product catalog entry not found"
        )
        
    # 3. Calculate Late Fees
    settlement = calculate_rental_settlement(
        due_date=rental.due_date,
        actual_return_date=actual_return_date,
        daily_rate=product.daily_rate,
        deposit_collected=rental.deposit_amount
    )
    
    rental.actual_return_date = actual_return_date
    rental.late_fee_charged = settlement["late_fee_charged"]
    rental.deposit_refunded = settlement["deposit_refunded"]
    rental.settled_at = datetime.now(timezone.utc)
    
    # 4. Increment availability catalog count
    product.quantity_available += 1
    
    session.add(product)
    session.add(rental)
    
    # 5. Log ledger actions
    if rental.late_fee_charged > 0:
        deduction = DepositLedgerEntry(
            rental_id=rental.id,
            entry_type="DEDUCTION",
            amount=rental.late_fee_charged
        )
        session.add(deduction)
        
    if rental.deposit_refunded > 0:
        refund = DepositLedgerEntry(
            rental_id=rental.id,
            entry_type="REFUNDED",
            amount=rental.deposit_refunded
        )
        session.add(refund)
        
    session.commit()
    session.refresh(rental)
    return rental
