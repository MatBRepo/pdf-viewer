"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CheckoutSheetPlan = "pro_monthly" | "pro_yearly";

export type CheckoutSheetProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  /** canonical prop */
  plan?: CheckoutSheetPlan;
  /** legacy alias (ignored if `plan` is provided) */
  planId?: CheckoutSheetPlan;

  /** Optional UI labels */
  planLabel?: string;              // e.g., "Plan Pro – miesięczna"
  priceLabel?: string;             // e.g., "€19 / miesiąc" or "€190 / rok"
  defaultCouponPlaceholder?: string;
};

export default function CheckoutSheet({
  open,
  onOpenChange,
  plan,
  planId,
  planLabel,
  priceLabel,
  defaultCouponPlaceholder = "np. SAVE10",
}: CheckoutSheetProps) {
  // Normalize plan
  const normalizedPlan: CheckoutSheetPlan = (plan ?? planId ?? "pro_monthly");

  const isMonthly = normalizedPlan === "pro_monthly";
  const headerPlanLabel =
    planLabel ?? (isMonthly ? "Plan Pro – miesięczna" : "Plan Pro – roczna");
  const headerPriceLabel =
    priceLabel ?? (isMonthly ? "€19 / miesiąc" : "€190 / rok");

  // Avoid any SSR/hydration oddities.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Do not render anything unless mounted AND open.
  if (!mounted || !open) return null;

  // Submit → create Checkout Session, redirect to Stripe
  async function goToStripe() {
    try {
      const r = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: normalizedPlan }),
      });
      const dj = await r.json();
      if (dj?.url) window.location.href = dj.url;
    } catch {
      // Optional: toast/error handling
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Only render SheetContent when open to avoid stray layout */}
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 z-[2147483647]" // absurdly high z-index
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Zakup subskrypcji — {headerPlanLabel}</SheetTitle>
            <SheetDescription>Cena: {headerPriceLabel}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-auto px-6 py-5 space-y-6">
            {/* Dane klienta */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium">Dane kontaktowe</h3>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="firstName">Imię</Label>
                    <Input id="firstName" placeholder="Jan" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="lastName">Nazwisko</Label>
                    <Input id="lastName" placeholder="Kowalski" required />
                  </div>
                </div>
              </div>
            </section>

            {/* Osoba prywatna / Firma */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium">Typ nabywcy</h3>
              <Tabs defaultValue="private" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="private">Osoba prywatna</TabsTrigger>
                  <TabsTrigger value="company">Firma</TabsTrigger>
                </TabsList>

                <TabsContent value="private" className="mt-4">
                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="address">Adres (opcjonalnie)</Label>
                      <Input id="address" placeholder="Ulica, nr, miejscowość" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="company" className="mt-4">
                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="companyName">Nazwa firmy</Label>
                      <Input id="companyName" placeholder="Acme Sp. z o.o." />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="taxId">NIP / VAT ID</Label>
                      <Input id="taxId" placeholder="PL1234567890" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="companyAddress">Adres firmy</Label>
                      <Input id="companyAddress" placeholder="Ulica, nr, miejscowość" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </section>

            {/* Kupon rabatowy */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium">Kod rabatowy</h3>
              <div className="flex gap-2">
                <Input placeholder={defaultCouponPlaceholder} className="flex-1" />
                <Button type="button" variant="outline">Zastosuj</Button>
              </div>
            </section>

            {/* Płatność (Stripe) – informacja */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium">Płatność</h3>
              <div className="rounded-lg border p-4 text-sm text-slate-600 dark:text-slate-300">
                Dane karty zostaną wprowadzone na bezpiecznej stronie Stripe po kliknięciu
                <span className="font-medium"> „Przejdź do płatności”</span>.
              </div>
            </section>
          </div>

          <SheetFooter className="px-6 py-4 border-t flex gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Anuluj
            </Button>
            <Button className="w-full" onClick={goToStripe}>
              Przejdź do płatności
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
