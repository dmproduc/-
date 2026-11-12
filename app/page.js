"use client"
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function BizPlanApp() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Жобалар тізімі және таңдалған жоба
  const [plans, setPlans] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')

  // Қосымша кестелер деректері
  const [finItems, setFinItems] = useState([])
  const [tasks, setTasks] = useState([])
  const [suppliers, setSuppliers] = useState([])

  // "What-If" Симулятор ползуноктары (% өзгеріс)
  const [simClientChange, setSimClientChange] = useState(0)
  const [simCheckChange, setSimCheckChange] = useState(0)

  // Жаңа элемент қосу формалары
  const [newFinName, setNewFinName] = useState('')
  const [newFinAmount, setNewFinAmount] = useState('')
  const [newFinCat, setNewFinCat] = useState('capex')

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDate, setNewTaskDate] = useState('')

  const [newSupName, setNewSupName] = useState('')
  const [newSupCat, setNewSupCat] = useState('Шикізат')
  const [newSupPhone, setNewSupPhone] = useState('')
  const [newSupNotes, setNewSupNotes] = useState('')

  // 1. Авторизацияны тексеру
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchPlans(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchPlans(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  // 2. Жобаларды жүктеу
  const fetchPlans = async (userId) => {
    const { data } = await supabase
      .from('business_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setPlans(data)
  }

  // Таңдалған жобаның ішкі деректерін жүктеу
  const openPlan = async (plan) => {
    setActivePlan(plan)
    setActiveTab('summary')
    const [finRes, taskRes, supRes] = await Promise.all([
      supabase.from('financial_items').select('*').eq('plan_id', plan.id).order('created_at'),
      supabase.from('roadmap_tasks').select('*').eq('plan_id', plan.id).order('created_at'),
      supabase.from('suppliers').select('*').eq('plan_id', plan.id).order('created_at')
    ])
    setFinItems(finRes.data || [])
    setTasks(taskRes.data || [])
    setSuppliers(supRes.data || [])
  }

  // Кіру / Тіркелу
  const handleAuth = async (type, e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = type === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else if (type === 'signup') alert('Тіркелу сәтті! Енді жүйеге кіріңіз.')
    setLoading(false)
  }

  // Жаңа бизнес-жоспар құру
  const createNewPlan = async (templateTitle = 'Жаңа Бизнес-Жоспар', industry = 'Жалпы') => {
    const { data, error } = await supabase
      .from('business_plans')
      .insert([{ user_id: session.user.id, title: templateTitle, industry }])
      .select()
      .single()
    if (!error && data) {
      setPlans([data, ...plans])
      openPlan(data)
    }
  }

  // Жобаны өшіру
  const deletePlan = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Бұл бизнес-жоспарды өшіруге сенімдісіз бе?')) return
    await supabase.from('business_plans').delete().eq('id', id)
    setPlans(plans.filter(p => p.id !== id))
  }

  // Прогресті есептеу
  const calculateProgress = (plan) => {
    let score = 15
    if (plan.summary?.length > 10) score += 20
    if (plan.marketing_strategy?.length > 10) score += 15
    if (plan.team_plan?.length > 10) score += 15
    if (Number(plan.average_check) > 0 && Number(plan.monthly_clients) > 0) score += 20
    if (plan.swot?.strengths?.length > 3) score += 15
    return Math.min(100, score)
  }

  // Жобаны сақтау
  const savePlanChanges = async (updatedPlan = activePlan) => {
    setLoading(true)
    const prog = calculateProgress(updatedPlan)
    const { error } = await supabase
      .from('business_plans')
      .update({
        title: updatedPlan.title,
        industry: updatedPlan.industry,
        status: updatedPlan.status,
        progress: prog,
        summary: updatedPlan.summary,
        idea_notes: updatedPlan.idea_notes,
        marketing_strategy: updatedPlan.marketing_strategy,
        team_plan: updatedPlan.team_plan,
        tax_regime: updatedPlan.tax_regime,
        average_check: Number(updatedPlan.average_check) || 0,
        unit_cost: Number(updatedPlan.unit_cost) || 0,
        monthly_clients: Number(updatedPlan.monthly_clients) || 0,
        lean_canvas: updatedPlan.lean_canvas,
        swot: updatedPlan.swot,
        is_public: updatedPlan.is_public,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedPlan.id)
    if (!error) {
      setActivePlan({ ...updatedPlan, progress: prog })
      fetchPlans(session.user.id)
    }
    setLoading(false)
  }

  // Lean Canvas-тан негізгі бөлімдерге авто-көшіру
  const syncCanvasToSummary = () => {
    const lc = activePlan.lean_canvas || {}
    const autoSummary = `Мәселе: ${lc.problem || '-'}\nШешім: ${lc.solution || '-'}\nБірегей ұсыныс (УТП): ${lc.uvp || '-'}`
    const autoMarketing = `Клиенттер сегменті: ${lc.segments || '-'}\nСату арналары: ${lc.channels || '-'}\nТабыс көздері: ${lc.revenue || '-'}`
    const updated = {
      ...activePlan,
      summary: activePlan.summary ? `${activePlan.summary}\n\n${autoSummary}` : autoSummary,
      marketing_strategy: activePlan.marketing_strategy ? `${activePlan.marketing_strategy}\n\n${autoMarketing}` : autoMarketing
    }
    setActivePlan(updated)
    savePlanChanges(updated)
    alert('Lean Canvas деректері Түйіндеме мен Маркетинг бөлімдеріне сәтті көшірілді!')
  }

  // Қаржы элементін қосу (CAPEX / OPEX)
  const addFinancialItem = async (e) => {
    e.preventDefault()
    if (!newFinName || !newFinAmount) return
    const { data } = await supabase.from('financial_items').insert([{
      plan_id: activePlan.id,
      user_id: session.user.id,
      category: newFinCat,
      name: newFinName,
      amount: Number(newFinAmount)
    }]).select().single()
    if (data) {
      setFinItems([...finItems, data])
      setNewFinName(''); setNewFinAmount('')
    }
  }

  const deleteFinItem = async (id) => {
    await supabase.from('financial_items').delete().eq('id', id)
    setFinItems(finItems.filter(i => i.id !== id))
  }

  // Чек-лист тапсырмасын қосу
  const addTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle) return
    const { data } = await supabase.from('roadmap_tasks').insert([{
      plan_id: activePlan.id,
      user_id: session.user.id,
      title: newTaskTitle,
      due_date: newTaskDate || null
    }]).select().single()
    if (data) {
      setTasks([...tasks, data])
      setNewTaskTitle(''); setNewTaskDate('')
    }
  }

  const toggleTask = async (task) => {
    const { data } = await supabase
      .from('roadmap_tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', task.id)
      .select().single()
    if (data) setTasks(tasks.map(t => t.id === task.id ? data : t))
  }

  // Жеткізуші (Поставщик) қосу
  const addSupplier = async (e) => {
    e.preventDefault()
    if (!newSupName) return
    const { data } = await supabase.from('suppliers').insert([{
      plan_id: activePlan.id,
      user_id: session.user.id,
      name: newSupName,
      category: newSupCat,
      phone: newSupPhone,
      price_notes: newSupNotes
    }]).select().single()
    if (data) {
      setSuppliers([...suppliers, data])
      setNewSupName(''); setNewSupPhone(''); setNewSupNotes('')
    }
  }

  // ҚАРЖЫЛЫҚ ЕСЕПТЕУЛЕР (Financial Engine)
  const totalCapex = finItems.filter(i => i.category === 'capex').reduce((s, i) => s + Number(i.amount), 0)
  const totalOpexFixed = finItems.filter(i => i.category === 'opex_fixed').reduce((s, i) => s + Number(i.amount), 0)
  const totalOpexVar = finItems.filter(i => i.category === 'opex_variable').reduce((s, i) => s + Number(i.amount), 0)

  const adjClients = Math.round((Number(activePlan?.monthly_clients) || 0) * (1 + simClientChange / 100))
  const adjCheck = Math.round((Number(activePlan?.average_check) || 0) * (1 + simCheckChange / 100))
  const unitCost = Number(activePlan?.unit_cost) || 0

  const monthlyRevenue = adjClients * adjCheck
  const monthlyCOGS = adjClients * unitCost
  const kaspiFee = monthlyRevenue * 0.0095

  let taxAmount = 0
  if (activePlan?.tax_regime === 'simplified_3') taxAmount = monthlyRevenue * 0.03
  else if (activePlan?.tax_regime === 'retail_4') taxAmount = monthlyRevenue * 0.04
  else if (activePlan?.tax_regime === 'general') taxAmount = Math.max(0, (monthlyRevenue - monthlyCOGS - totalOpexFixed - totalOpexVar) * 0.10)

  const totalMonthlyExpenses = totalOpexFixed + totalOpexVar + monthlyCOGS + kaspiFee + taxAmount
  const netProfit = monthlyRevenue - totalMonthlyExpenses
  const paybackMonths = netProfit > 0 ? (totalCapex / netProfit).toFixed(1) : 'Өтелмейді (Минус)'

  // Залалсыздық нүктесі (Break-even point)
  const marginPerClient = adjCheck - unitCost - (adjCheck * 0.0095)
  const breakEvenClients = marginPerClient > 0 ? Math.ceil((totalOpexFixed + totalOpexVar) / marginPerClient) : 0

  // АВТОРИЗАЦИЯ ЭКРАНЫ
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 text-white">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
          <h1 className="text-3xl font-bold mb-2 text-center text-blue-400">BizPlan Pro</h1>
          <p className="text-slate-400 text-center text-sm mb-6">Идеядан дайын бизнес-жоспар мен қаржылық модельге дейінгі біртұтас орта</p>
          <form className="space-y-4">
            <input type="email" placeholder="Email поштаңыз" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white" />
            <input type="password" placeholder="Құпиясөз (кемінде 6 таңба)" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white" />
            <div className="flex gap-3 pt-2">
              <button onClick={(e) => handleAuth('login', e)} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-medium">Кіру</button>
              <button onClick={(e) => handleAuth('signup', e)} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 p-3 rounded-lg font-medium">Тіркелу</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ЖЕКЕ КАБИНЕТ (Жоба таңдалмаған кезде)
  if (!activePlan) {
    return (
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-6xl mx-auto">
          <div className={`flex justify-between items-center p-5 rounded-2xl shadow-sm mb-8 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div>
              <h1 className="text-2xl font-bold">Менің Бизнес Жобаларым</h1>
              <p className="text-sm text-slate-400">{session.user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setDarkMode(!darkMode)} className="px-3 py-2 rounded-lg border text-sm">
                {darkMode ? '☀️ Жарық режим' : '🌙 Қараңғы режим'}
              </button>
              <button onClick={() => supabase.auth.signOut()} className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/20">Шығу</button>
            </div>
          </div>

          {/* Шаблондар */}
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Жаңа жоба бастау (Немесе дайын шаблон таңдау)</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button onClick={() => createNewPlan('Жаңа Бизнес Жоба', 'Жалпы')} className="p-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 text-left">+ Таза жоба ашу</button>
              <button onClick={() => createNewPlan('Кофехана ашу', 'Қоғамдық тамақтану')} className={`p-4 border rounded-xl hover:border-blue-500 text-left font-medium ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>☕ Кофехана</button>
              <button onClick={() => createNewPlan('Азық-түлік дүкені', 'Сауда')} className={`p-4 border rounded-xl hover:border-blue-500 text-left font-medium ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>🛒 Дүкен / Маркет</button>
              <button onClick={() => createNewPlan('Оқу орталығы', 'Білім беру')} className={`p-4 border rounded-xl hover:border-blue-500 text-left font-medium ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>🎓 Оқу орталығы</button>
              <button onClick={() => createNewPlan('Сұлулық салоны', 'Қызмет көрсету')} className={`p-4 border rounded-xl hover:border-blue-500 text-left font-medium ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>✂️ Сұлулық салоны</button>
            </div>
          </div>

          {/* Сақталған жобалар тізімі */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan.id} onClick={() => openPlan(plan)} className={`p-6 rounded-2xl border hover:shadow-md transition cursor-pointer flex flex-col justify-between ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-full font-medium">{plan.industry}</span>
                    <button onClick={(e) => deletePlan(plan.id, e)} className="text-xs text-red-400 hover:text-red-600">Өшіру</button>
                  </div>
                  <h3 className="text-xl font-bold mt-3">{plan.title}</h3>
                  <p className="text-sm text-slate-400 mt-2 line-clamp-2">{plan.summary || 'Түйіндеме әлі толтырылмаған...'}</p>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Толтырылуы</span>
                    <span className="font-semibold text-blue-500">{plan.progress || 15}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full" style={{ width: `${plan.progress || 15}%` }} />
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs text-slate-400">
                    <span>{new Date(plan.updated_at).toLocaleDateString()}</span>
                    <span className="text-blue-500 font-semibold">Ашу →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ЖОБА КОНСТРУКТОРЫ
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
      <header className={`border-b px-6 py-4 flex flex-wrap justify-between items-center sticky top-0 z-10 print:hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => setActivePlan(null)} className="text-slate-400 hover:text-blue-500 font-medium text-sm">← Тізімге қайту</button>
          <input
            value={activePlan.title}
            onChange={e => setActivePlan({ ...activePlan, title: e.target.value })}
            className="text-xl font-bold bg-transparent border-b border-transparent focus:border-blue-500 outline-none px-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className="px-3 py-2 rounded-lg border text-xs">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => window.print()} className="bg-slate-500/10 hover:bg-slate-500/20 px-4 py-2 rounded-lg text-sm font-medium">📄 PDF шығару</button>
          <button onClick={() => savePlanChanges()} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
            {loading ? 'Сақталуда...' : '💾 Сақтау'}
          </button>
        </div>
      </header>

      {/* Навигация (Tabs) */}
      <div className={`border-b px-6 flex gap-2 overflow-x-auto print:hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {[
          { id: 'summary', label: '1. Түйіндеме & Маркетинг' },
          { id: 'ideas', label: '2. Идеялар & Lean Canvas' },
          { id: 'swot', label: '3. SWOT & Команда' },
          { id: 'finance', label: '4. Қаржы, Салық & Симулятор' },
          { id: 'roadmap', label: '5. Қадамдық Чек-лист' },
          { id: 'suppliers', label: '6. Поставщиктер базасы' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Негізгі мазмұн */}
      <main className="max-w-6xl w-full mx-auto p-6 flex-1">
        {/* 1-БӨЛІМ */}
        {activeTab === 'summary' && (
          <div className={`space-y-6 p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Бизнес саласы</label>
                <input value={activePlan.industry || ''} onChange={e => setActivePlan({ ...activePlan, industry: e.target.value })} className="w-full p-2.5 border rounded-lg bg-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Жоба мәртебесі</label>
                <select value={activePlan.status || 'draft'} onChange={e => setActivePlan({ ...activePlan, status: e.target.value })} className="w-full p-2.5 border rounded-lg bg-transparent">
                  <option value="draft">Жасалуда (Draft)</option>
                  <option value="completed">Дайын (Completed)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Жоба түйіндемесі (Executive Summary & Миссиясы)</label>
              <textarea rows={4} value={activePlan.summary || ''} onChange={e => setActivePlan({ ...activePlan, summary: e.target.value })} placeholder="Бизнестің негізгі мәні, кімге арналған және қандай құндылық береді..." className="w-full p-3 border rounded-lg bg-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Маркетинг және Сату стратегиясы (Instagram, TikTok, 2GIS, Клиент тарту)</label>
              <textarea rows={4} value={activePlan.marketing_strategy || ''} onChange={e => setActivePlan({ ...activePlan, marketing_strategy: e.target.value })} placeholder="Клиенттерді қайдан және қалай тартамыз? Жарнама бюджеті мен акциялар..." className="w-full p-3 border rounded-lg bg-transparent" />
            </div>
          </div>
        )}

        {/* 2-БӨЛІМ */}
        {activeTab === 'ideas' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className="text-lg font-bold mb-2">💡 Еркін идеялар мен гипотезалар блокноты</h3>
              <textarea rows={4} value={activePlan.idea_notes || ''} onChange={e => setActivePlan({ ...activePlan, idea_notes: e.target.value })} placeholder="Ойға келген кез келген қосымша идеяларды, жаңа тауар түрлерін осында жазып қойыңыз..." className="w-full p-3 border rounded-lg bg-transparent" />
            </div>

            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">📋 Lean Canvas (Бір беттік бизнес-модель)</h3>
                <button onClick={syncCanvasToSummary} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500">
                  🔄 Негізгі жоспарға авто-көшіру
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'problem', title: '1. Клиенттің мәселесі' },
                  { key: 'solution', title: '2. Шешім (Сіздің өнім)' },
                  { key: 'uvp', title: '3. Бірегей ұсыныс (УТП)' },
                  { key: 'segments', title: '4. Клиенттер сегменті' },
                  { key: 'channels', title: '5. Сату арналары' },
                  { key: 'revenue', title: '6. Табыс көздері' },
                  { key: 'costs', title: '7. Шығындар құрылымы' },
                  { key: 'metrics', title: '8. Негізгі метрикалар' },
                  { key: 'advantage', title: '9. Артықшылықтар' },
                ].map(item => (
                  <div key={item.key} className="border p-3 rounded-xl">
                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1">{item.title}</label>
                    <textarea
                      rows={3}
                      value={activePlan.lean_canvas?.[item.key] || ''}
                      onChange={e => setActivePlan({
                        ...activePlan,
                        lean_canvas: { ...activePlan.lean_canvas, [item.key]: e.target.value }
                      })}
                      className="w-full p-2 text-sm bg-transparent border rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3-БӨЛІМ */}
        {activeTab === 'swot' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className="text-lg font-bold mb-4">🎯 SWOT-Талдау</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <label className="font-bold text-emerald-500 text-sm">Күшті жақтары (Strengths)</label>
                  <textarea rows={3} value={activePlan.swot?.strengths || ''} onChange={e => setActivePlan({ ...activePlan, swot: { ...activePlan.swot, strengths: e.target.value } })} className="w-full mt-2 p-2 rounded border bg-transparent text-sm" />
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <label className="font-bold text-red-500 text-sm">Әлсіз жақтары (Weaknesses)</label>
                  <textarea rows={3} value={activePlan.swot?.weaknesses || ''} onChange={e => setActivePlan({ ...activePlan, swot: { ...activePlan.swot, weaknesses: e.target.value } })} className="w-full mt-2 p-2 rounded border bg-transparent text-sm" />
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <label className="font-bold text-blue-500 text-sm">Мүмкіндіктер (Opportunities)</label>
                  <textarea rows={3} value={activePlan.swot?.opportunities || ''} onChange={e => setActivePlan({ ...activePlan, swot: { ...activePlan.swot, opportunities: e.target.value } })} className="w-full mt-2 p-2 rounded border bg-transparent text-sm" />
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <label className="font-bold text-amber-500 text-sm">Қауіптер мен Тәуекелдер (Threats)</label>
                  <textarea rows={3} value={activePlan.swot?.threats || ''} onChange={e => setActivePlan({ ...activePlan, swot: { ...activePlan.swot, threats: e.target.value } })} className="w-full mt-2 p-2 rounded border bg-transparent text-sm" />
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className="text-lg font-bold mb-2">👥 Ұйымдастыру жоспары және Команда</h3>
              <textarea rows={4} value={activePlan.team_plan || ''} onChange={e => setActivePlan({ ...activePlan, team_plan: e.target.value })} placeholder="Қанша қызметкер керек, олардың міндеттері мен жалақы кестесі..." className="w-full p-3 border rounded-lg bg-transparent" />
            </div>
          </div>
        )}

        {/* 4-БӨЛІМ */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                <span className="text-xs text-slate-400">Бастапқы инвестиция (CAPEX)</span>
                <p className="text-lg font-bold mt-1">{totalCapex.toLocaleString()} ₸</p>
              </div>
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                <span className="text-xs text-slate-400">Айлық айналым (Выручка)</span>
                <p className="text-lg font-bold text-blue-500 mt-1">{monthlyRevenue.toLocaleString()} ₸</p>
              </div>
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                <span className="text-xs text-slate-400">Таза пайда (Net Profit)</span>
                <p className={`text-lg font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{Math.round(netProfit).toLocaleString()} ₸</p>
              </div>
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                <span className="text-xs text-slate-400">Залалсыздық нүктесі</span>
                <p className="text-lg font-bold text-amber-500 mt-1">{breakEvenClients} сатылым</p>
              </div>
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                <span className="text-xs text-slate-400">Өзін-өзі ақтау (ROI)</span>
                <p className="text-lg font-bold text-indigo-500 mt-1">{paybackMonths} {typeof paybackMonths === 'string' && paybackMonths.includes('Өтелмейді') ? '' : 'ай'}</p>
              </div>
            </div>

            {/* Unit-экономика және ҚР Салық режимі */}
            <div className={`p-6 rounded-2xl border grid grid-cols-1 md:grid-cols-4 gap-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Орташа чек (1 сатылым, ₸)</label>
                <input type="number" value={activePlan.average_check || ''} onChange={e => setActivePlan({ ...activePlan, average_check: e.target.value })} className="w-full p-2.5 border rounded-lg bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">1 өнімнің өзіндік құны (Unit Cost, ₸)</label>
                <input type="number" value={activePlan.unit_cost || ''} onChange={e => setActivePlan({ ...activePlan, unit_cost: e.target.value })} className="w-full p-2.5 border rounded-lg bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Айлық клиенттер (сатылым) саны</label>
                <input type="number" value={activePlan.monthly_clients || ''} onChange={e => setActivePlan({ ...activePlan, monthly_clients: e.target.value })} className="w-full p-2.5 border rounded-lg bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">ҚР Салық режимі</label>
                <select value={activePlan.tax_regime || 'simplified_3'} onChange={e => setActivePlan({ ...activePlan, tax_regime: e.target.value })} className="w-full p-2.5 border rounded-lg bg-transparent">
                  <option value="simplified_3">Оңайлатылған (Упрощенка 3%)</option>
                  <option value="retail_4">Бөлшек салық (Розничный 4%)</option>
                  <option value="general">Жалпы режим (Таза пайдадан 10%)</option>
                </select>
              </div>
            </div>

            {/* What-If Симуляторы */}
            <div className="bg-slate-800 text-white p-6 rounded-2xl border border-slate-700">
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <h3 className="font-bold text-lg">🎛️ «Егер... болса ше?» (What-If) Сценарийлер симуляторы</h3>
                <div className="flex gap-2">
                  <button onClick={() => { setSimClientChange(-30); setSimCheckChange(-10) }} className="text-xs px-3 py-1 bg-red-500/20 text-red-300 rounded-lg">Пессимистік (-30%)</button>
                  <button onClick={() => { setSimClientChange(0); setSimCheckChange(0) }} className="text-xs px-3 py-1 bg-slate-600 text-white rounded-lg">Реалистік (0%)</button>
                  <button onClick={() => { setSimClientChange(30); setSimCheckChange(15) }} className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg">Оптимистік (+30%)</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-slate-300 flex justify-between">
                    <span>Клиенттер саны өзгерсе: <b>{simClientChange > 0 ? `+${simClientChange}%` : `${simClientChange}%`}</b> ({adjClients} клиент)</span>
                  </label>
                  <input type="range" min="-50" max="100" step="5" value={simClientChange} onChange={e => setSimClientChange(Number(e.target.value))} className="w-full mt-2" />
                </div>
                <div>
                  <label className="text-sm text-slate-300 flex justify-between">
                    <span>Орташа чек өзгерсе: <b>{simCheckChange > 0 ? `+${simCheckChange}%` : `${simCheckChange}%`}</b> ({adjCheck} ₸)</span>
                  </label>
                  <input type="range" min="-50" max="100" step="5" value={simCheckChange} onChange={e => setSimCheckChange(Number(e.target.value))} className="w-full mt-2" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">Салық: {Math.round(taxAmount).toLocaleString()} ₸ | Kaspi QR (0.95%): {Math.round(kaspiFee).toLocaleString()} ₸ | Өзіндік құн шығыны: {monthlyCOGS.toLocaleString()} ₸</p>
            </div>

            {/* CAPEX және OPEX шығындар тізімі */}
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
              <h3 className="font-bold mb-4">Шығындар тізімі (CAPEX және OPEX)</h3>
              <form onSubmit={addFinancialItem} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                <input placeholder="Шығын атауы (мысалы: Жалдау ақысы)" value={newFinName} onChange={e => setNewFinName(e.target.value)} className="p-2.5 border rounded-lg text-sm bg-transparent" />
                <input type="number" placeholder="Сомасы (₸)" value={newFinAmount} onChange={e => setNewFinAmount(e.target.value)} className="p-2.5 border rounded-lg text-sm bg-transparent" />
                <select value={newFinCat} onChange={e => setNewFinCat(e.target.value)} className="p-2.5 border rounded-lg text-sm bg-transparent">
                  <option value="capex">Бастапқы инвестиция (CAPEX)</option>
                  <option value="opex_fixed">Ай сайынғы тұрақты шығын (OPEX)</option>
                  <option value="opex_variable">Ай сайынғы айнымалы шығын</option>
                </select>
                <button type="submit" className="bg-blue-600 text-white rounded-lg text-sm font-medium p-2.5">+ Шығын қосу</button>
              </form>

              <div className="space-y-2">
                {finItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border text-sm">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="ml-3 text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">
                        {item.category === 'capex' ? 'Бастапқы (CAPEX)' : 'Айлық (OPEX)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{Number(item.amount).toLocaleString()} ₸</span>
                      <button onClick={() => deleteFinItem(item.id)} className="text-red-500 text-xs">Өшіру</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5-БӨЛІМ */}
        {activeTab === 'roadmap' && (
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
            <h3 className="font-bold text-lg mb-4">✅ Бизнесті ашудың қадамдық чек-листі (Roadmap)</h3>
            <form onSubmit={addTask} className="flex gap-3 mb-6">
              <input placeholder="Қадамды жазыңыз (мысалы: ЖК тіркеу, Ғимарат табу...)" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="flex-1 p-2.5 border rounded-lg text-sm bg-transparent" />
              <input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} className="p-2.5 border rounded-lg text-sm bg-transparent" />
              <button type="submit" className="bg-blue-600 text-white px-5 rounded-lg text-sm font-medium">+ Қосу</button>
            </form>
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} onClick={() => toggleTask(task)} className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:border-blue-500">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={task.is_completed} readOnly className="w-4 h-4" />
                    <span className={task.is_completed ? 'line-through text-slate-400' : 'font-medium'}>{task.title}</span>
                  </div>
                  {task.due_date && <span className="text-xs text-slate-400">{task.due_date}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6-БӨЛІМ */}
        {activeTab === 'suppliers' && (
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
            <h3 className="font-bold text-lg mb-4">🚚 Жеткізушілер мен Серіктестер базасы (Поставщиктер)</h3>
            <form onSubmit={addSupplier} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              <input placeholder="Компания / Аты-жөні" value={newSupName} onChange={e => setNewSupName(e.target.value)} className="p-2.5 border rounded-lg text-sm bg-transparent" />
              <input placeholder="Телефон / WhatsApp" value={newSupPhone} onChange={e => setNewSupPhone(e.target.value)} className="p-2.5 border rounded-lg text-sm bg-transparent" />
              <input placeholder="Бағасы мен шарттары" value={newSupNotes} onChange={e => setNewSupNotes(e.target.value)} className="p-2.5 border rounded-lg text-sm bg-transparent" />
              <button type="submit" className="bg-blue-600 text-white rounded-lg text-sm font-medium p-2.5">+ Контакт қосу</button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map(sup => (
                <div key={sup.id} className="p-4 border rounded-xl">
                  <div className="font-bold">{sup.name}</div>
                  <div className="text-sm text-blue-500 mt-1">📞 {sup.phone}</div>
                  <div className="text-xs text-slate-400 mt-2">{sup.price_notes}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
