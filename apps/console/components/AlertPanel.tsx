"use client";

import { fw } from "@fireweaveai/web-sdk/start";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { COPY } from "../lib/copy";
import { useTick } from "../lib/tick";
import { ago } from "../lib/time";
import { Drawer } from "./Drawer";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";
import { StatusPill } from "./StatusPill";
import { TriagePill } from "./TriagePill";

type Referral = {
  id: string;
  patientName: string | null;
  status: string;
  triage: string | null;
  filename: string;
  reason?: string | null;
  createdAt?: string;
};

const CLOSED = new Set(["complete", "completed", "rejected", "ineligible", "fax_back", "failed"]);

function alertPanelEnabled() {
  // @fireweave-controlpoint alert-side-panel
  return fw.controlPoints.getBooleanValue("alert-side-panel", false);
}

function useAlertPanel() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(alertPanelEnabled());
    return fw.subscribe(() => setOn(alertPanelEnabled()));
  }, []);
  return on;
}

function isAlert(row: Referral) {
  return row.triage === "STAT" && !CLOSED.has(row.status);
}

export function AlertPanel() {
  const enabled = useAlertPanel();
  const now = useTick();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Referral[] | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let stop = false;
    void (async () => {
      const res = await fetch("/api/referrals");
      if (stop || !res.ok) return;
      setRows((await res.json()) as Referral[]);
    })();
    return () => {
      stop = true;
    };
  }, [enabled, open]);

  if (!enabled) return null;

  const alerts = (rows ?? []).filter(isAlert);

  return (
    <>
      <button type="button" className="nav-item" aria-label="Alerts" aria-expanded={open} onClick={() => setOpen(true)}>
        <Bell className="nav-icon" size={16} aria-hidden="true" />
        <span>Alerts</span>
        {alerts.length > 0 ? <span className="badge">{alerts.length}</span> : null}
      </button>
      {open ? (
        <Drawer title="Alerts" narrow onClose={() => setOpen(false)}>
          {rows === null ? (
            <Skeleton rows={3} />
          ) : alerts.length === 0 ? (
            <EmptyState title={COPY.emptyAlerts} />
          ) : (
            alerts.map((row) => (
              <Link className="alert-row" key={row.id} href={`/hub/${row.id}`} onClick={() => setOpen(false)}>
                <span className="patient">{row.patientName ?? row.filename}</span>
                <span>
                  <TriagePill triage={row.triage} /> <StatusPill status={row.status} />
                </span>
                <span className="muted">{row.reason ?? "Urgent referral"}</span>
                <span className="mono muted">{ago(row.createdAt, now)}</span>
              </Link>
            ))
          )}
        </Drawer>
      ) : null}
    </>
  );
}
