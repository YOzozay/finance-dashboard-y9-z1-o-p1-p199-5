"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/config/api";
import { formatMoney } from "@/lib/format";

export default function SettingsPage() {
  const [config, setConfig] = useState({});
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [salaryForm, setSalaryForm] = useState({
    effective_date: "",
    salary: ""
  });

  // ================= LOAD =================
  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const cfg = await apiGet({ action: "getConfig" });
      const salaries = await apiGet({ action: "getSalaryHistory" });

      setConfig(cfg || {});
      setSalaryHistory(salaries || []);
    } catch (err) {
      setError("Cannot load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ================= SAVE CONFIG =================
  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      await apiPost({
        action: "updateConfig",
        ...config
      });
      alert("Config updated");
    } finally {
      setSaving(false);
    }
  };

  // ================= ADD SALARY =================
  const handleAddSalary = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await apiPost({
        action: "addSalaryHistory",
        ...salaryForm
      });

      setSalaryForm({
        effective_date: "",
        salary: ""
      });

      await load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-10 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold">System Settings</h1>

      {error && <div className="error-banner">{error}</div>}

      {/* ================= SYSTEM CONFIG ================= */}
      <div className="card space-y-6">
        <div className="font-semibold text-lg">
          Income & OT Configuration
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {Object.keys(config).map((key) => (
            <div key={key}>
              <div className="text-sm text-subtle mb-1">
                {key}
              </div>
              <input
                className="input-base"
                type="number"
                value={config[key]}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    [key]: e.target.value
                  })
                }
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      {/* ================= SALARY HISTORY ================= */}
      <div className="card space-y-6">
        <div className="font-semibold text-lg">
          Salary History
        </div>

        <form
          onSubmit={handleAddSalary}
          className="grid md:grid-cols-3 gap-4"
        >
          <div>
            <div className="text-sm text-subtle mb-1">
              Effective Date
            </div>
            <input
              type="date"
              className="input-base"
              value={salaryForm.effective_date}
              onChange={(e) =>
                setSalaryForm({
                  ...salaryForm,
                  effective_date: e.target.value
                })
              }
              required
            />
          </div>

          <div>
            <div className="text-sm text-subtle mb-1">
              Salary
            </div>
            <input
              type="number"
              className="input-base"
              value={salaryForm.salary}
              onChange={(e) =>
                setSalaryForm({
                  ...salaryForm,
                  salary: e.target.value
                })
              }
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={saving}
            >
              Add Salary
            </button>
          </div>
        </form>

        {/* Table */}
        <div className="card-overflow">
          <table className="w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="py-3 px-4 text-left">
                  Effective Date
                </th>
                <th className="py-3 px-4 text-right">
                  Salary
                </th>
              </tr>
            </thead>
            <tbody>
              {salaryHistory.length === 0 && (
                <tr>
                  <td
                    colSpan="2"
                    className="py-6 text-center text-subtle"
                  >
                    No salary history
                  </td>
                </tr>
              )}

              {salaryHistory.map((item, idx) => (
                <tr key={idx} className="table-row">
                  <td className="py-3 px-4">
                    {item.effective_date}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatMoney(item.salary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}