"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/config/api";
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
    note: ""
  });

  // ======================
  // LOAD WORKLOGS
  // ======================
  const loadWorklogs = async () => {
    try {
      setLoadingList(true);
      setError(null);

      const res = await fetch(
        `${API_BASE}?action=getWorklogs&payMonth=${payMonth}`
      );

      if (!res.ok) throw new Error("Failed to load worklogs");

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      if (Array.isArray(data)) {
        setWorklogs(data);
      } else {
        setWorklogs([]);
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Cannot load worklogs");
      setWorklogs([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadWorklogs();
  }, [payMonth]);

  // ======================
  // FORM CHANGE
  // ======================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ======================
  // ADD WORKLOG
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(API_BASE, {
        method: "POST",
        body: JSON.stringify({
          action: "addWorklog",
          ...form
        })
      });

      if (!res.ok) throw new Error("Failed to add worklog");

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      setForm({
        date: getToday(),
        holiday_hours: "",
        ot_evening_1_5x: "",
        ot_evening_3x: "",
        note: ""
      });

      await loadWorklogs();

    } catch (err) {
      console.error(err);
      setError(err.message || "Error saving worklog");
    } finally {
      setSubmitting(false);
    }
  };

  // ======================
  // DELETE WORKLOG
  // ======================
  const handleDelete = async (id) => {
    if (!confirm("Delete this worklog entry?")) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(API_BASE, {
        method: "POST",
        body: JSON.stringify({
          action: "deleteWorklog",
          id
        })
      });

      if (!res.ok) throw new Error("Failed to delete worklog");

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      await loadWorklogs();

    } catch (err) {
      console.error(err);
      setError(err.message || "Error deleting worklog");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold">Worklog</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Month Selector */}
      <div className="max-w-xs">
        <Input
          type="month"
          value={payMonth}
          onChange={(e) => setPayMonth(e.target.value)}
          disabled={submitting}
        />
      </div>

      {/* Add Form */}
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">

        <Input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          disabled={submitting}
          required
        />

        <Input
          type="number"
          step="0.01"
          min="0"
          name="holiday_hours"
          placeholder="Holiday Hours"
          value={form.holiday_hours}
          onChange={handleChange}
          disabled={submitting}
        />

        <Input
          type="number"
          step="0.01"
          min="0"
          name="ot_evening_1_5x"
          placeholder="OT Evening 1.5x"
          value={form.ot_evening_1_5x}
          onChange={handleChange}
          disabled={submitting}
        />

        <Input
          type="number"
          step="0.01"
          min="0"
          name="ot_evening_3x"
          placeholder="OT Evening 3x"
          value={form.ot_evening_3x}
          onChange={handleChange}
          disabled={submitting}
        />

        <Input
          name="note"
          placeholder="Note"
          value={form.note}
          onChange={handleChange}
          disabled={submitting}
        />

        <button
          type="submit"
          disabled={submitting}
          className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Add Worklog"}
        </button>
      </form>

      {/* Loading List */}
      {loadingList && (
        <div className="text-center text-gray-500">
          Loading...
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="border-b bg-gray-50 dark:bg-gray-800">
            <tr className="text-left">
              <th className="py-2 px-2">Date</th>
              <th className="py-2 px-2 text-right">Holiday</th>
              <th className="py-2 px-2 text-right">OT 1.5x</th>
              <th className="py-2 px-2 text-right">OT 3x</th>
              <th className="py-2 px-2">Note</th>
              <th className="py-2 px-2 text-right"></th>
            </tr>
          </thead>

          <tbody>
            {!loadingList && worklogs.length === 0 && (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">
                  No worklogs found for this period
                </td>
              </tr>
            )}

            {worklogs.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-2 px-2">{item.date}</td>
                <td className="py-2 px-2 text-right">{item.holiday_hours || 0}</td>
                <td className="py-2 px-2 text-right">{item.ot15 || 0}</td>
                <td className="py-2 px-2 text-right">{item.ot3 || 0}</td>
                <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                  {item.note || "-"}
                </td>
                <td className="py-2 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={submitting}
                    className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {worklogs.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500 dark:text-gray-400">Total Days</div>
              <div className="font-semibold">{worklogs.length}</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Holiday Hours</div>
              <div className="font-semibold">
                {worklogs.reduce((sum, w) => sum + (Number(w.holiday_hours) || 0), 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">OT 1.5x Hours</div>
              <div className="font-semibold">
                {worklogs.reduce((sum, w) => sum + (Number(w.ot15) || 0), 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">OT 3x Hours</div>
              <div className="font-semibold">
                {worklogs.reduce((sum, w) => sum + (Number(w.ot3) || 0), 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}