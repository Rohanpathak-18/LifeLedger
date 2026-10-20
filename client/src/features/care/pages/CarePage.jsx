import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Check, Plus, Trash2, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../products/services/product.service.js';
import { careService } from '../care.service.js';

const today = () => new Date().toISOString().slice(0, 10);

export default function CarePage() {
  const [repairs, setRepairs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [products, setProducts] = useState([]);
  const [formType, setFormType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [repairRows, taskRows, productResult] = await Promise.all([
        careService.listRepairs(),
        careService.listMaintenance(),
        productService.list({ limit: 100 }),
      ]);
      setRepairs(repairRows);
      setTasks(taskRows);
      setProducts(productResult.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error?.message ||
          'Could not load care records.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      if (formType === 'repair') {
        await careService.createRepair({ ...values, cost: values.cost || '' });
      } else {
        await careService.createMaintenance(values);
      }
      toast.success(
        formType === 'repair' ? 'Repair saved.' : 'Maintenance task saved.',
      );
      setFormType('');
      form.reset();
      await load();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.error?.message ||
          'Could not save this record.',
      );
    }
  }

  async function complete(task) {
    try {
      await careService.updateMaintenance(task._id, {
        status: task.status === 'completed' ? 'open' : 'completed',
      });
      await load();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.error?.message ||
          'Could not update the task.',
      );
    }
  }

  async function remove(type, item) {
    const name = type === 'repair' ? item.productId.name : item.title;
    if (!window.confirm(`Delete this ${type} record for ${name}?`)) return;
    try {
      if (type === 'repair') await careService.removeRepair(item._id);
      else await careService.removeMaintenance(item._id);
      toast.success('Record deleted.');
      await load();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.error?.message ||
          'Could not delete this record.',
      );
    }
  }

  return (
    <main className="main-content care-page">
      <div className="collection-page-heading">
        <div>
          <span className="section-kicker">LOOK AFTER WHAT YOU OWN</span>
          <h1>
            Care & repairs,
            <br />
            <em>kept in good order.</em>
          </h1>
          <p>Log service history and keep the next maintenance date in view.</p>
        </div>
        <div className="detail-actions">
          <button
            className="secondary-button"
            onClick={() => setFormType('maintenance')}
            disabled={!products.length}
          >
            <Plus size={15} /> Add care task
          </button>
          <button
            className="primary-button"
            onClick={() => setFormType('repair')}
            disabled={!products.length}
          >
            <Wrench size={15} /> Log a repair
          </button>
        </div>
      </div>
      {error && (
        <div className="inline-error" role="alert">
          {error}
          <button onClick={load}>Try again</button>
        </div>
      )}
      {formType && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="form-panel modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="care-form-title"
          >
            <div className="modal-heading">
              <div>
                <span className="section-kicker">OWNERSHIP HISTORY</span>
                <h2 id="care-form-title">
                  {formType === 'repair' ? 'Log a repair' : 'Schedule care'}
                </h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setFormType('')}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {products.length ? (
              <form className="record-form" onSubmit={save}>
                <label className="form-wide">
                  Product
                  <select name="productId" required>
                    <option value="">Choose an item</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
                {formType === 'repair' ? (
                  <>
                    <label>
                      Service date
                      <input
                        name="serviceDate"
                        type="date"
                        defaultValue={today()}
                        required
                      />
                    </label>
                    <label>
                      Service provider
                      <input name="provider" maxLength="120" />
                    </label>
                    <label className="form-wide">
                      What was done
                      <input name="description" maxLength="1000" required />
                    </label>
                    <label>
                      Cost
                      <input name="cost" type="number" min="0" step="0.01" />
                    </label>
                    <label>
                      Currency
                      <input
                        name="currency"
                        defaultValue="USD"
                        minLength="3"
                        maxLength="3"
                        required
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="form-wide">
                      Task title
                      <input
                        name="title"
                        maxLength="160"
                        required
                        placeholder="e.g. Replace water filter"
                      />
                    </label>
                    <label>
                      Due date
                      <input name="dueDate" type="date" required />
                    </label>
                    <label>
                      Repeat
                      <select name="recurrence">
                        <option value="none">Does not repeat</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Every 3 months</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </label>
                    <label className="form-wide">
                      Notes
                      <input name="description" maxLength="1000" />
                    </label>
                  </>
                )}
                <div className="form-actions form-wide">
                  <button className="primary-button" type="submit">
                    Save record
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setFormType('')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="inventory-empty compact-empty">
                <p>Add a product before creating care records.</p>
              </div>
            )}
          </section>
        </div>
      )}
      {loading ? (
        <p className="muted-copy">Loading your care records…</p>
      ) : (
        <div className="care-columns">
          <section className="care-list-panel">
            <div className="section-heading">
              <div>
                <span className="section-kicker">SERVICE HISTORY</span>
                <h2>Repairs</h2>
              </div>
              <Wrench size={18} />
            </div>
            {repairs.length ? (
              repairs.map((repair) => (
                <article className="care-record" key={repair._id}>
                  <div className="care-record-icon">
                    <Wrench size={16} />
                  </div>
                  <div className="care-record-copy">
                    <strong>{repair.description}</strong>
                    <span>
                      {repair.productId.name} ·{' '}
                      {new Date(repair.serviceDate).toLocaleDateString()}
                      {repair.provider ? ` · ${repair.provider}` : ''}
                    </span>
                  </div>
                  <div className="care-record-cost">
                    {repair.cost == null
                      ? '—'
                      : `${repair.currency} ${repair.cost}`}
                  </div>
                  <button
                    className="icon-button danger-action"
                    aria-label="Delete repair"
                    onClick={() => remove('repair', repair)}
                  >
                    <Trash2 size={14} />
                  </button>
                </article>
              ))
            ) : (
              <p className="muted-copy">
                Repair visits you add will appear here.
              </p>
            )}
          </section>
          <section className="care-list-panel">
            <div className="section-heading">
              <div>
                <span className="section-kicker">A GENTLE NUDGE</span>
                <h2>Maintenance</h2>
              </div>
              <CalendarClock size={18} />
            </div>
            {tasks.length ? (
              tasks.map((task) => (
                <article
                  className={`care-record ${task.status === 'completed' ? 'care-record-done' : ''}`}
                  key={task._id}
                >
                  <button
                    className="task-check"
                    onClick={() => complete(task)}
                    aria-label={
                      task.status === 'completed'
                        ? 'Mark task open'
                        : 'Complete task'
                    }
                  >
                    {task.status === 'completed' && <Check size={13} />}
                  </button>
                  <div className="care-record-copy">
                    <strong>{task.title}</strong>
                    <span>
                      {task.productId.name} · Due{' '}
                      {new Date(task.dueDate).toLocaleDateString()} ·{' '}
                      {task.recurrence}
                    </span>
                  </div>
                  <button
                    className="icon-button danger-action"
                    aria-label="Delete maintenance task"
                    onClick={() => remove('task', task)}
                  >
                    <Trash2 size={14} />
                  </button>
                </article>
              ))
            ) : (
              <p className="muted-copy">
                Scheduled care tasks will appear here.
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
