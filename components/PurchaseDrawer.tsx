"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";

type Plan = "monthly" | "yearly";

type PurchaseDrawerProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: Plan;
  priceLabel: string;       // e.g. "€19 / miesiąc" or "€190 / rok"
};

const baseSchema = z.object({
  email: z.string().email("Podaj poprawny e-mail"),
  shopName: z.string().min(2, "Podaj nazwę sklepu"),
  firstName: z.string().min(2, "Imię jest wymagane"),
  lastName: z.string().min(2, "Nazwisko jest wymagane"),
  coupon: z.string().optional(),
});

const companySchema = baseSchema.extend({
  companyName: z.string().min(2, "Nazwa firmy jest wymagana"),
  taxId: z.string().min(4, "NIP/VAT jest wymagany"),
  invoiceAddress: z.string().min(4, "Adres do faktury jest wymagany"),
});

const personSchema = baseSchema.extend({
  invoiceAddress: z.string().min(4, "Adres do faktury jest wymagany"),
});

export function PurchaseDrawer({ open, onOpenChange, plan, priceLabel }: PurchaseDrawerProps) {
  const [tab, setTab] = useState<"person" | "company">("person");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Shared fields
  const [email, setEmail] = useState("");
  const [shopName, setShopName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [coupon, setCoupon] = useState("");

  // Company-only
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");

  function validate() {
    const payload = {
      email, shopName, firstName, lastName, invoiceAddress, coupon: coupon || undefined,
      ...(tab === "company" ? { companyName, taxId } : {}),
    };
    const schema = tab === "company" ? companySchema : personSchema;
    const r = schema.safeParse(payload);
    if (!r.success) {
      const next: Record<string, string> = {};
      for (const issue of r.error.issues) {
        next[issue.path.join(".")] = issue.message;
      }
      setErrors(next);
      return null;
    }
    setErrors({});
    return payload;
  }

  async function startCheckout() {
    const payload = validate();
    if (!payload) return;

    setBusy(true);
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          email: payload.email,
          coupon: payload.coupon,
          metadata: {
            plan,
            shopName: payload.shopName,
            firstName: payload.firstName,
            lastName: payload.lastName,
            invoiceAddress: payload.invoiceAddress,
            customerType: tab,
            companyName: tab === "company" ? companyName : "",
            taxId: tab === "company" ? taxId : "",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Nie udało się rozpocząć zakupu.");
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      alert(e?.message || "Błąd połączenia ze Stripe.");
      setBusy(false);
    }
  }

  function Field({
    id, label, value, onChange, placeholder, error, type = "text",
  }: {
    id: string; label: string; value: string; onChange: (v: string)=>void; placeholder?: string; error?: string; type?: string;
  }) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={error ? "border-rose-400 focus-visible:ring-rose-400" : ""}
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Zamówienie
            </Badge>
          </div>
          <SheetTitle>Kup subskrypcję — {plan === "monthly" ? "Miesięcznie" : "Rocznie"}</SheetTitle>
          <SheetDescription>
            Wypełnij dane rozliczeniowe i przejdź do bezpiecznej płatności Stripe. <span className="font-medium">{priceLabel}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-2 space-y-6">
          {/* Who */}
          <Tabs value={tab} onValueChange={(v)=>setTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="person">Osoba prywatna</TabsTrigger>
              <TabsTrigger value="company">Firma</TabsTrigger>
            </TabsList>

            {/* Person */}
            <TabsContent value="person" className="space-y-4 pt-4">
              <Field id="email" label="E-mail" value={email} onChange={setEmail} placeholder="you@example.com" error={errors.email}/>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field id="firstName" label="Imię" value={firstName} onChange={setFirstName} error={errors.firstName}/>
                <Field id="lastName" label="Nazwisko" value={lastName} onChange={setLastName} error={errors.lastName}/>
              </div>
              <Field id="invoiceAddress" label="Adres do faktury" value={invoiceAddress} onChange={setInvoiceAddress} error={errors.invoiceAddress}/>
            </TabsContent>

            {/* Company */}
            <TabsContent value="company" className="space-y-4 pt-4">
              <Field id="email2" label="E-mail firmowy" value={email} onChange={setEmail} placeholder="billing@firma.pl" error={errors.email}/>
              <Field id="companyName" label="Nazwa firmy" value={companyName} onChange={setCompanyName} error={errors.companyName}/>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field id="firstName2" label="Imię (osoba kontaktowa)" value={firstName} onChange={setFirstName} error={errors.firstName}/>
                <Field id="lastName2" label="Nazwisko (osoba kontaktowa)" value={lastName} onChange={setLastName} error={errors.lastName}/>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field id="taxId" label="NIP / VAT ID" value={taxId} onChange={setTaxId} error={errors.taxId}/>
                <Field id="invoiceAddress2" label="Adres do faktury" value={invoiceAddress} onChange={setInvoiceAddress} error={errors.invoiceAddress}/>
              </div>
            </TabsContent>
          </Tabs>

          {/* Shop details */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Dane sklepu</div>
            <Field id="shopName" label="Nazwa sklepu / witryny" value={shopName} onChange={setShopName} placeholder="np. Acme Store" error={errors.shopName}/>
          </div>

          {/* Coupon */}
          <div className="space-y-2">
            <Label htmlFor="coupon">Kod rabatowy (opcjonalnie)</Label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                value={coupon}
                onChange={(e)=>setCoupon(e.target.value)}
                placeholder="np. WELCOME10"
                className="flex-1"
              />
              <Button type="button" variant="outline" disabled={!coupon}>
                Zastosuj
              </Button>
            </div>
            <p className="text-xs text-slate-500">Zniżka zostanie pokazana na stronie Stripe (o ile kod jest ważny).</p>
          </div>

          <div className="rounded-xl border border-slate-200/70 p-3 dark:border-slate-800/60 text-sm text-slate-600 dark:text-slate-300">
            <div className="inline-flex items-center gap-2 font-medium mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Płatność Stripe
            </div>
            Twoje dane rozliczeniowe trafią do Stripe jako meta-dane zamówienia. Rozliczenie i faktura po stronie Stripe.
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button
            onClick={startCheckout}
            disabled={busy}
            className="w-full inline-flex items-center gap-2"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Przejdź do płatności — {priceLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
