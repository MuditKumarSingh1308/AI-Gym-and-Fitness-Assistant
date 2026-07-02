"use client";

import { useEffect, useState, useTransition } from "react";
import { Apple, Calculator, ChefHat, Loader2, RefreshCw, Droplets } from "lucide-react";

export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import {
  calculateBmi,
  calculateCalories,
  fetchCurrentDietPlan,
  generateDietPlan,
  generateGroceryList,
  getStoredToken,
  type DietPlan,
  type GroceryList,
} from "@/lib/api";

type FormState = {
  age: number;
  height_cm: number;
  weight_kg: number;
  gender: "male" | "female" | "other";
  activity_level: "sedentary" | "light" | "moderate" | "active" | "athlete";
  goal: "weight_loss" | "weight_gain" | "maintenance" | "fat_loss" | "muscle_gain";
  food_preference: "vegetarian" | "non_vegetarian" | "high_protein";
  allergies: string;
  cuisine_preference: string;
};

type DietMeal = {
  meal_type: string;
  name: string;
  calories: number;
  items: string[];
};

type GroceryItemList = {
  items: string[];
};

const initialForm: FormState = {
  age: 28,
  height_cm: 172,
  weight_kg: 72,
  gender: "male",
  activity_level: "moderate",
  goal: "maintenance",
  food_preference: "vegetarian",
  allergies: "",
  cuisine_preference: "indian",
};

export default function Page() {
  const [form, setForm] = useState(initialForm);
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [grocery, setGrocery] = useState<GroceryList | GroceryItemList | null>(null);
  const [bmi, setBmi] = useState<{ bmi: number; category: string } | null>(null);
  const [calories, setCalories] = useState<{ bmr: number; tdee: number; daily_calorie_target: number; macro_targets: Record<string, number> } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchCurrentDietPlan(getStoredToken())
      .then((currentPlan) => {
        if (currentPlan) {
          setPlan(currentPlan);
          setGrocery(currentPlan.grocery_list);
          setBmi({ bmi: currentPlan.bmi, category: currentPlan.bmi_category });
          setCalories({
            bmr: currentPlan.bmr,
            tdee: currentPlan.tdee,
            daily_calorie_target: currentPlan.daily_calorie_target,
            macro_targets: currentPlan.macro_targets,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Dietician"
          title="Personalized nutrition planning"
          description="Calculate BMI, BMR, calories, macros, Indian meal plans, and grocery lists from one guided form."
          actions={
            <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="BMI" value={bmi ? bmi.bmi.toFixed(1) : "24.0"} icon={Calculator} hint={bmi?.category ?? "Calculated from height and weight."} />
          <StatCard title="BMR" value={calories ? Math.round(calories.bmr).toString() : "1,620"} icon={ChefHat} hint="Basal metabolic rate returned by the backend." />
          <StatCard title="Daily calories" value={calories ? Math.round(calories.daily_calorie_target).toString() : "2,100"} icon={Apple} hint="Target calories based on goal and activity level." />
          <StatCard title="Water intake" value={plan ? `${plan.water_intake_liters.toFixed(1)} L` : "3.0 L"} icon={Droplets} hint="Hydration guidance tailored to the selected plan." />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
          <SectionCard title="Create a diet plan" description="This form mirrors the FastAPI diet module and supports Indian meal planning, vegetarian and high-protein presets.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Age" value={form.age} onChange={(value) => setForm((current) => ({ ...current, age: value }))} />
              <Field label="Height (cm)" value={form.height_cm} onChange={(value) => setForm((current) => ({ ...current, height_cm: value }))} />
              <Field label="Weight (kg)" value={form.weight_kg} onChange={(value) => setForm((current) => ({ ...current, weight_kg: value }))} />
              <SelectField label="Gender" value={form.gender} onChange={(value) => setForm((current) => ({ ...current, gender: value }))} options={["male", "female", "other"]} />
              <SelectField label="Goal" value={form.goal} onChange={(value) => setForm((current) => ({ ...current, goal: value }))} options={["weight_loss", "weight_gain", "maintenance", "fat_loss", "muscle_gain"]} />
              <SelectField label="Activity" value={form.activity_level} onChange={(value) => setForm((current) => ({ ...current, activity_level: value }))} options={["sedentary", "light", "moderate", "active", "athlete"]} />
              <SelectField label="Food preference" value={form.food_preference} onChange={(value) => setForm((current) => ({ ...current, food_preference: value }))} options={["vegetarian", "non_vegetarian", "high_protein"]} />
              <TextField
                label="Cuisine"
                value={form.cuisine_preference}
                onChange={(value) => setForm((current) => ({ ...current, cuisine_preference: value }))}
              />
              <label className="md:col-span-2 block">
                <span className="mb-2 block text-sm font-medium">Allergies</span>
                <input
                  value={form.allergies}
                  onChange={(event) => setForm((current) => ({ ...current, allergies: event.target.value }))}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                  placeholder="peanuts, dairy, soy"
                />
              </label>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(() => {
                  void (async () => {
                    const payload = {
                      age: Number(form.age),
                      height_cm: Number(form.height_cm),
                      weight_kg: Number(form.weight_kg),
                      gender: form.gender,
                      activity_level: form.activity_level,
                      goal: form.goal,
                      food_preference: form.food_preference,
                      allergies: form.allergies.split(",").map((item) => item.trim()).filter(Boolean),
                      cuisine_preference: form.cuisine_preference,
                    };
                    const [bmiResult, calorieResult, planResult, groceryResult] = await Promise.all([
                      calculateBmi(payload, getStoredToken()),
                      calculateCalories(payload, getStoredToken()),
                      generateDietPlan(payload, getStoredToken()),
                      generateGroceryList(payload, getStoredToken()),
                    ]);
                    setBmi(bmiResult);
                    setCalories(calorieResult);
                    setPlan(planResult);
                    setGrocery(groceryResult);
                  })().catch(() => undefined);
                });
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
              Generate plan
            </button>
          </SectionCard>

          <SectionCard title="Nutrition output" description="Preview of the diet plan, macros, meals, and grocery list returned from the backend.">
            {plan ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Metric label="Protein" value={`${Math.round(plan.protein_intake_g)} g`} />
                  <Metric label="Calories" value={`${Math.round(plan.daily_calorie_target)} kcal`} />
                  <Metric label="BMI" value={`${plan.bmi.toFixed(1)} (${plan.bmi_category})`} />
                  <Metric label="TDEE" value={`${Math.round(plan.tdee)} kcal`} />
                </div>
                <div className="grid gap-3">
                  {((plan.meals ?? []) as DietMeal[]).map((meal) => (
                    <article key={`${meal.meal_type}-${meal.name}`} className="rounded-[22px] border border-border bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{meal.meal_type}</p>
                          <p className="mt-1 font-semibold">{meal.name}</p>
                        </div>
                        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{Math.round(meal.calories)} kcal</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{meal.items.join(", ")}</p>
                    </article>
                  ))}
                </div>
                <div className="rounded-[22px] border border-border bg-background p-4">
                  <p className="font-semibold">Grocery list</p>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    {grocery?.items?.map((item: string) => (
                      <span key={item} className="rounded-full border border-border px-3 py-2">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">Submit the form to build a custom meal plan, grocery list, and macro split.</p>
            )}
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input value={value} onChange={(event) => onChange(Number(event.target.value))} type="number" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none" />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} type="text" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none" />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: T[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none">
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
