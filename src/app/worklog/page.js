"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/config/api";
import { getToday, getCurrentPayMonth } from "@/lib/date";
import Input from "@/components/ui/Input";

export default function WorklogPage() {
  const [payMonth, setPayMonth] = useState(getCurrentPayMonth());
  const [worklogs, setWorklogs] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    date: getToday(),
    holiday_hours: "",
    ot_evening_1_5x: "",
    ot_evening_3x: "",
    note: "",
  });

  // ======================
  // LOAD
  // ======================
  const loadWorklogs = async () => {
    try {
      setLoadingList(true);
      setError(null);

      const data = await apiGet({
        action: "getWorklogs",
        payMonth,
      });

      setWorklogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Cannot load worklogs");
      setWorklogs([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadWorklogs();
  }, [payMonth]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const holiday = Number(form.holiday_hours) || 0;
    const ot15 = Number(form.ot_evening_1_5x) || 0;
    const ot3 = Number(form.ot_evening_3x) || 0;

    if (holiday < 0 || ot15 < 0 || ot3 < 0) {
      setError("Hours cannot be negative");
      return;
    }

    const tempId = `temp_${Date.now()}`;
    const optimisticItem = {
      id: tempId,
      date: form.date,
      holiday_hours: holiday,
      ot15,
      ot3,
      note: form.note,
    };

    setWorklogs((prev) => [optimisticItem, ...prev]);
    setForm({ date: getToday(), holiday_hours: "", ot_evening_1_5x: "", ot_evening_3x: "", note: "" });
    setSubmitting(true);

    try {
      await apiPost({
        action: "addWorklog",
        date: optimisticItem.date,
        holiday_hours: holiday,
        ot_evening_1_5x: ot15,
        ot_evening_3x: ot3,
        note: optimisticItem.note,
      });
      await loadWorklogs();
    } catch (err) {
      setWorklogs((prev) => prev.filter((w) => w.id !== tempId));
      setForm({ date: optimisticItem.date, holiday_hours: String(holiday), ot_evening_1_5x: String(ot15), ot_evening_3x: String(ot3), note: optimisticItem.note });
      setError("Error saving worklog");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this worklog entry?")) return;

    const snapshot = worklogs.find((w) => w.id === id);
    setWorklogs((prev) => prev.filter((w) => w.id !== id));

    try {
      await apiPost({ action: "deleteWorklog", id });
    } catch (err) {
      if (snapshot) setWorklogs((prev) => [...prev, snapshot]);
      setError("Error deleting worklog");
    }
  };

  const totalHoliday = worklogs.reduce(
    (sum, w) => sum + (Number(w.holiday_hours) || 0),
    0
  );

  const totalOT15 = worklogs.reduce(
    (sum, w) => sum + (Number(w.ot15) || 0),
    0
  );

  const totalOT3 = worklogs.reduce(
    (sum, w) => sum + (Number(w.ot3) || 0),
    0
  );

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold">Worklog</h1>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Month Selector */}
      <div className="max-w-xs space-y-1">
        <label className="text-sm font-medium text-muted">Pay Month</label>
        <Input
          type="month"
          value={payMonth}
          onChange={(e) => setPayMonth(e.target.value)}
          disabled={submitting}
        />
      </div>

      {/* FORM CARD */}
      <form
        onSubmit={handleSubmit}
        className="form-card grid md:grid-cols-2 gap-4"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted">
            Date <span className="text-[var(--color-danger)]">*</span>
          </label>
          <Input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            disabled={submitting}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-muted">
            Holiday Hours
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            name="holiday_hours"
            placeholder="0"
            value={form.holiday_hours}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-muted">
            OT Evening 1.5x (hrs)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            name="ot_evening_1_5x"
            placeholder="0"
            value={form.ot_evening_1_5x}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-muted">
            OT Evening 3x (hrs)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            name="ot_evening_3x"
            placeholder="0"
            value={form.ot_evening_3x}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-muted">Note</label>
          <Input
            name="note"
            placeholder="Optional note"
            value={form.note}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="col-span-full btn-submit"
        >
          {submitting ? "Saving..." : "Add Worklog"}
        </button>
      </form>

      {/* TABLE CARD */}
      <div className="card-overflow">
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-right">Holiday</th>
              <th className="py-3 px-4 text-right">OT 1.5x</th>
              <th className="py-3 px-4 text-right">OT 3x</th>
              <th className="py-3 px-4 text-left">Note</th>
              <th className="py-3 px-4 text-right"></th>
            </tr>
          </thead>

          <tbody>
            {!loadingList && worklogs.length === 0 && (
              <tr>
                <td colSpan="6" className="py-6 text-center text-subtle">
                  No worklogs found for this period
                </td>
              </tr>
            )}

            {worklogs.map((item) => (
              <tr
                key={item.id}
                className="table-row"
              >
                <td className="py-3 px-4">{item.date}</td>
                <td className="py-3 px-4 text-right">
                  {item.holiday_hours || 0}
                </td>
                <td className="py-3 px-4 text-right">
                  {item.ot15 || 0}
                </td>
                <td className="py-3 px-4 text-right">
                  {item.ot3 || 0}
                </td>
                <td className="py-3 px-4 text-subtle">
                  {item.note || "-"}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {worklogs.length > 0 && (
          <div className="table-footer p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-subtle">Total Days</div>
                <div className="font-semibold">{worklogs.length}</div>
              </div>
              <div>
                <div className="text-subtle">Holiday Hours</div>
                <div className="font-semibold">
                  {totalHoliday.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-subtle">OT 1.5x</div>
                <div className="font-semibold">
                  {totalOT15.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-subtle">OT 3x</div>
                <div className="font-semibold">
                  {totalOT3.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}