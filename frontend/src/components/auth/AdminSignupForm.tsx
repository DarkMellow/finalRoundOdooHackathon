import { useState } from "react";
import { Button } from "@/components/ui/button";

function AdminSignupForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Admin signup data:", formData);

    // Admin signup backend logic will be connected later
  };

  return (
    <section className="min-h-screen bg-[#f6f5f4] px-4 py-12 text-[#111111]">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-[12px] border border-[#e6e6e6] bg-white shadow-[rgba(0,0,0,0.01)_0_0.175px_1.041px,rgba(0,0,0,0.02)_0_0.8px_2.925px,rgba(0,0,0,0.027)_0_2.025px_7.847px] lg:grid-cols-[1fr_420px]">
          <aside className="hidden min-h-full bg-[#213183] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-12 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.12em] uppercase">
                <span className="size-8 rounded-full bg-white/12" />
                RentalOS
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-semibold tracking-[0.14em] uppercase text-white/80">
                    Administration
                  </div>
                  <h1 className="max-w-md text-4xl font-bold leading-none tracking-[-1px] text-white">
                    Open admin workspace
                  </h1>
                </div>

                <p className="max-w-md text-sm leading-6 text-white/75">
                  Create your control-center profile and start coordinating operations.
                </p>
              </div>
            </div>
          </aside>

          <main className="flex items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-12">
            <div className="w-full">
              <div className="mb-8">
                <div className="mb-4 inline-flex items-center rounded-full border border-[#e6e6e6] bg-[#f6f5f4] px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase text-[#615d59]">
                  Admin access
                </div>
                <h2 className="text-4xl font-bold leading-none tracking-[-1px] text-[#111111]">
                  Admin sign up
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#615d59]">
                  Create an admin account.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[12px] font-semibold tracking-[0.12em] text-[#615d59]" htmlFor="firstName">
                      First Name
                    </label>
                    <input
                      className="w-full rounded-[4px] border border-[#dcdcdc] bg-white px-3 py-2 text-sm text-[#111111] placeholder:text-[#a39e98] outline-none transition focus:border-[#0075de] focus:ring-3 focus:ring-[#0075de]/20"
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[12px] font-semibold tracking-[0.12em] text-[#615d59]" htmlFor="lastName">
                      Last Name
                    </label>
                    <input
                      className="w-full rounded-[4px] border border-[#dcdcdc] bg-white px-3 py-2 text-sm text-[#111111] placeholder:text-[#a39e98] outline-none transition focus:border-[#0075de] focus:ring-3 focus:ring-[#0075de]/20"
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-semibold tracking-[0.12em] text-[#615d59]" htmlFor="email">
                    Email address
                  </label>
                  <input
                    className="w-full rounded-[4px] border border-[#dcdcdc] bg-white px-3 py-2 text-sm text-[#111111] placeholder:text-[#a39e98] outline-none transition focus:border-[#0075de] focus:ring-3 focus:ring-[#0075de]/20"
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter admin email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[12px] font-semibold tracking-[0.12em] text-[#615d59]" htmlFor="password">
                      Password
                    </label>
                    <input
                      className="w-full rounded-[4px] border border-[#dcdcdc] bg-white px-3 py-2 text-sm text-[#111111] placeholder:text-[#a39e98] outline-none transition focus:border-[#0075de] focus:ring-3 focus:ring-[#0075de]/20"
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[12px] font-semibold tracking-[0.12em] text-[#615d59]" htmlFor="confirmPassword">
                      Confirm password
                    </label>
                    <input
                      className="w-full rounded-[4px] border border-[#dcdcdc] bg-white px-3 py-2 text-sm text-[#111111] placeholder:text-[#a39e98] outline-none transition focus:border-[#0075de] focus:ring-3 focus:ring-[#0075de]/20"
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button className="w-full rounded-full bg-[#0075de] px-8 py-3 text-sm font-semibold text-white hover:bg-[#005bab]" type="submit">
                    Create Admin Account
                  </Button>
                </div>

                <p className="pt-3 text-center text-sm text-[#615d59]">
                  Already have an admin account? <a className="font-semibold text-[#0075de] hover:text-[#005bab]" href="/admin/login">Admin Login</a>
                </p>
              </form>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

export default AdminSignupForm;