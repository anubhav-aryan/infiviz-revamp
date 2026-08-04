"use client";

import { useCallback, useState } from "react";
import {
  DEFAULT_DIM,
  DIM_OPTIONS,
  type DimKey,
  type Persona,
} from "../_data/analytics";
import { AnalyticsHeader } from "./analytics-header";
import { CategoryBody } from "./category-body";
import { ExecBody } from "./exec-body";
import { FieldBody } from "./field-body";
import { RegionalBody } from "./regional-body";
import { Segmented } from "./shared";

/**
 * Mirrors the design doc's component state: which persona is driving the page,
 * which dimension band C is sliced by, and whether the category ribbon splits
 * competitors out by brand.
 */
export function Analytics() {
  const [persona, setPersona] = useState<Persona>("exec");
  const [dim, setDim] = useState<DimKey>(DEFAULT_DIM.exec);
  const [breakout, setBreakout] = useState(false);

  // Each persona slices by a different set of dimensions, so the picker cannot
  // carry a selection the incoming persona has no option for.
  const changePersona = useCallback((next: Persona) => {
    setPersona(next);
    setDim(DEFAULT_DIM[next]);
  }, []);

  const toggleBreakout = useCallback(() => setBreakout((on) => !on), []);

  const dimPicker = (
    <Segmented
      options={DIM_OPTIONS[persona]}
      value={dim}
      onChange={setDim}
      label="Dimension"
    />
  );

  return (
    <>
      <AnalyticsHeader persona={persona} onPersonaChange={changePersona} />

      {persona === "exec" ? (
        <ExecBody dim={dim} dimPicker={dimPicker} />
      ) : null}
      {persona === "regional" ? (
        <RegionalBody dim={dim} dimPicker={dimPicker} />
      ) : null}
      {persona === "category" ? (
        <CategoryBody
          breakout={breakout}
          onToggleBreakout={toggleBreakout}
          dimPicker={dimPicker}
        />
      ) : null}
      {persona === "field" ? (
        <FieldBody dim={dim} dimPicker={dimPicker} />
      ) : null}
    </>
  );
}
