from typing import List, Optional
from sqlmodel import Session, select
from app.features.products.models import Product
from app.features.products.schemas import ProductCreate, ProductUpdate

def get_product(session: Session, product_id: int) -> Optional[Product]:
    """
    Retrieve a single product by ID.
    """
    return session.get(Product, product_id)

def list_products(session: Session) -> List[Product]:
    """
    Retrieve all products in the catalog.
    """
    statement = select(Product)
    return session.exec(statement).all()

def create_product(session: Session, product_in: ProductCreate) -> Product:
    """
    Create a new product in the catalog.
    """
    db_product = Product.model_validate(product_in)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

def update_product(session: Session, db_product: Product, product_in: ProductUpdate) -> Product:
    """
    Update an existing product.
    """
    product_data = product_in.model_dump(exclude_unset=True)
    for key, value in product_data.items():
        setattr(db_product, key, value)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

def delete_product(session: Session, db_product: Product) -> None:
    """
    Delete a product from the catalog.
    """
    session.delete(db_product)
    session.commit()
