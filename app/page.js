"use client"
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  LayoutDashboard, FileText, Lightbulb, Target, Calculator,
  CheckSquare, Truck, Plus, Trash2, Printer, Save, LogOut,
  ChevronRight, Sparkles, ArrowLeft, CheckCircle2, Moon, Sun,
  TrendingUp, Briefcase, Layers, DollarSign, Percent, RefreshCw, Eye
} from 'lucide-react'

// НАҚТЫ ДЕРЕКТЕРІ БАР ДАЙЫН ШАБЛОНДАР БАЗАСЫ
const TEMPLATES = {
  coffee: {
    title: 'Specialty Кофехана',
    industry: 'Қоғамдық тамақтану (HoReCa)',
    average_check: 1800,
    unit_cost: 550,
    monthly_clients: 2800,
    tax_regime: 'simplified_3',
    summary: 'Қала орталығында авторлық кофе мен жаңа піскен круассандар ұсынатын заманауи форматтағы кофехана. Негізгі аудитория — студенттер, фрилансерлер және кеңсе қызметкерлері. Мақсатымыз — жоғары сервис пен тұрақты дәм арқылы күнделікті 90-100 тұрақты клиентке қызмет көрсету.',
    marketing_strategy: '1. Instagram және TikTok-та баристаның кофе дайындау процесін (Reels) күнделікті жариялау.\n2. 2GIS пен Яндекс Картада жоғары рейтинг (5.0) жинау: пікір қалдырған клиентке тегін сироп немесе печенье ұсыну.\n3. «Әрбір 6-шы кофе тегін» адалдық картасын енгізу.',
    team_plan: '1. Аға бариста (2/2 ауысым) — 250 000 ₸\n2. Екінші бариста (2/2 ауысым) — 220 000 ₸\n3. Бухгалтер (аутсорсинг) — 50 000 ₸\n4. Тазалық қызметкері — 80 000 ₸',
    lean_canvas: {
      problem: 'Сапалы дәннен дайындалған кофенің тапшылығы және жұмыс істеуге жайлы орынның аздығы.',
      solution: '100% Арабика дәнінен жылдам кофе және тегін Wi-Fi мен розеткалары бар жайлы аймақ.',
      uvp: '3 минутта дайын болатын премиум кофе және таңғы 08:00-ден бастап ыстық пісірмелер.',
      segments: '18-35 жас аралығындағы жастар, ІТ мамандары, жақын маңдағы бизнес-орталық қызметкерлері.',
      channels: 'Instagram Target, 2GIS гео-жарнама, көшедегі штендер, блогерлермен коллаборация.',
      revenue: 'Кофе сатылымы (65%), десерттер мен сэндвичтер (25%), салқын сусындар мен дән сату (10%).',
      costs: 'Кофемашина мен жабдықтар, ғимарат жалдау, бариста жалақысы, кофе дәні мен сүт.',
      metrics: 'Күндізгі чек саны, қайта оралған клиенттер үлесі (Retention), орташа чек сомасы.',
      advantage: 'Тәжірибелі шеф-бариста және жергілікті кондитерлік цехпен эксклюзивті келісімшарт.'
    },
    swot: {
      strengths: 'Трафигі жоғары локация, авторлық рецептура, төмен өзіндік құн (жоғары маржинальдылық).',
      weaknesses: 'Жаңа бренд ретінде танымалдылықтың төмендігі, бариста кадрларының ауысу қаупі.',
      opportunities: 'Кеңселерге таңғы ас пен кофе жеткізу қызметін қосу, жазғы терраса ашу.',
      threats: 'Ірі желілік кофеханалардың жақын маңнан ашылуы, кофе дәні бағасының өсуі.'
    },
    finItems: [
      { category: 'capex', name: 'Кәсіби 2-постты кофемашина мен гриндер', amount: 2400000 },
      { category: 'capex', name: 'Бөлмені жөндеу және жиһаз алу', amount: 1800000 },
      { category: 'capex', name: 'Тоңазытқыш, мұз генераторы, витрина', amount: 850000 },
      { category: 'opex_fixed', name: 'Ғимаратты жалға алу (45 ш.м.)', amount: 450000 },
      { category: 'opex_fixed', name: 'Екі бариста мен персонал жалақысы', amount: 600000 },
      { category: 'opex_variable', name: 'SMM, таргет жарнама және 2GIS', amount: 150000 }
    ],
    tasks: [
      { title: 'ЖК (ИП) тіркеу және Kaspi Pay қосу', is_completed: true },
      { title: 'Адам көп жүретін бірінші линиядан орын жалдау', is_completed: false },
      { title: 'Кофе дәні мен сүт жеткізушілермен шарт жасасу', is_completed: false },
      { title: 'Техникалық ашылу және дегустация өткізу', is_completed: false }
    ]
  },
  store: {
    title: 'Үй жанындағы минимаркет',
    industry: 'Бөлшек сауда (Retail)',
    average_check: 2500,
    unit_cost: 1950,
    monthly_clients: 4500,
    tax_regime: 'retail_4',
    summary: 'Жаңа тұрғын үй кешенінің 1-қабатында орналасқан заманауи өзіне-өзі қызмет көрсету дүкені. Күнделікті сұраныстағы азық-түлік, свежий нан, сүт өнімдері мен жеміс-жидектер.',
    marketing_strategy: 'Тұрғын үй кешенінің WhatsApp/Telegram чаттарына жарнама беру, 5000 ₸ жоғары саудаға пәтерге дейін тегін жеткізу.',
    team_plan: '2 кассир-сатушы (ауысыммен) — 400 000 ₸, Тауар қабылдаушы — 200 000 ₸.',
    lean_canvas: {
      problem: 'Тұрғын үй кешені ішінде таза әрі ассортименті толық дүкеннің жоқтығы.',
      solution: 'Кезексіз, жарық, өзі таңдап алатын минимаркет форматы.',
      uvp: 'Күнде таңертең ыстық нан және 15 минутта пәтерге жеткізу.',
      segments: 'Тұрғын үй кешенінің тұрғындары (отбасылар, балалар).',
      channels: 'Үй чаттары, лифт ішіндегі жарнама, маңдайша (вывеска).',
      revenue: 'Азық-түлік, сусындар, тұрмыстық химия сатылымы.',
      costs: 'Тауар айналымы, тоңазытқыштар, жалдау ақысы, электр энергиясы.',
      metrics: 'Күндізгі түсім, тауардың айналымдылығы, жарамдылық мерзімі өткен тауар үлесі.',
      advantage: 'Тұрғын үй кешеніндегі ең ыңғайлы орналасу нүктесі.'
    },
    swot: {
      strengths: 'Тұрақты клиенттік база (үй тұрғындары), күн сайынғы сұраныс.',
      weaknesses: 'Тауар қорын үнемі толтырып отыру үшін үлкен айналым қаражаты қажет.',
      opportunities: 'Дайын тағамдар (кулинария) мен кофе бұрышын қосу.',
      threats: 'Ірі супермаркет желілерінің (Magnum Daily т.б.) жақын жерден ашылуы.'
    },
    finItems: [
      { category: 'capex', name: 'Сауда сөрелері (стеллаждар) мен тоңазытқыш витриналар', amount: 3200000 },
      { category: 'capex', name: 'Бастапқы тауар қорын сатып алу', amount: 4500000 },
      { category: 'capex', name: 'Кассалық жабдық (POS-терминал, сканер, таразы)', amount: 450000 },
      { category: 'opex_fixed', name: 'Дүкен орнын жалдау (70 ш.м.)', amount: 500000 },
      { category: 'opex_fixed', name: 'Сатушылар жалақысы және коммуналдық төлем', amount: 550000 }
    ],
    tasks: [
      { title: 'Сауда сөрелерін орнату және POS-жүйені баптау', is_completed: false },
      { title: 'Дистрибьюторлармен (нан, сүт, сусындар) келісімшарт жасау', is_completed: false }
    ]
  },
  edu: {
    title: 'Білім беру және ҰБТ орталығы',
    industry: 'Білім беру (EdTech)',
    average_check: 35000,
    unit_cost: 5000,
    monthly_clients: 85,
    tax_regime: 'simplified_3',
    summary: 'Мектеп оқушыларын ҰБТ-ға, НИШ/БИЛ лицейлеріне дайындайтын және ағылшын/IT курстарын оқытатын заманауи білім орталығы.',
    marketing_strategy: 'Тегін сынақ сабақтары мен профориентациялық тестілеу өткізу, ата-аналарға арналған Instagram таргет жарнамасы.',
    team_plan: '4 пән мұғалімі (сағаттық/пайыздық төлем), 1 Администратор-сатушы — 200 000 ₸ + бонус.',
    lean_canvas: {
      problem: 'Мектеп бағдарламасының грантқа түсуге жеткіліксіздігі.',
      solution: 'Шағын топтарда (6-8 оқушы) аптасына 3 рет интенсивті дайындық және ай сайынғы сынақ тестілері.',
      uvp: 'Келісімшарт бойынша нәтиже кепілдігі және ата-анаға апта сайынғы есеп.',
      segments: '5-11 сынып оқушыларының ата-аналары.',
      channels: 'Instagram/Facebook таргет, мектеп маңындағы іс-шаралар, сарафанное радио.',
      revenue: 'Ай сайынғы абонемент төлемдері, жеке (индивидуалды) сабақтар.',
      costs: 'Кеңсе жалдау, мұғалімдер гонорары, оқу материалдарын басып шығару.',
      metrics: 'Оқушылар саны, сынақ сабағынан сатып алу конверсиясы, орташа оқу ұзақтығы (LTV).',
      advantage: 'Авторлық оқу методикасы және үздік санатты оқытушылар құрамы.'
    },
    swot: {
      strengths: 'Төмен бастапқы шығын, жоғары рентабельділік, тұрақты абонементтік төлем.',
      weaknesses: 'Жаз айларындағы маусымдық сұраныстың төмендеуі.',
      opportunities: 'Жазғы IT және тілдік лагерь ашу, онлайн-платформа іске қосу.',
      threats: 'Мықты мұғалімдердің өз алдына бөлініп кетуі.'
    },
    finItems: [
      { category: 'capex', name: 'Парталар, орындықтар, маркерлік тақталар мен проекторлар', amount: 1400000 },
      { category: 'capex', name: 'Ноутбуктер мен ресепшн жиһазы', amount: 800000 },
      { category: 'opex_fixed', name: '4 кабинеттік кеңсені жалға алу', amount: 400000 },
      { category: 'opex_fixed', name: 'Мұғалімдер мен администратордың тұрақты қоры', amount: 950000 },
      { category: 'opex_variable', name: 'Таргет жарнама (Лидогенерация)', amount: 200000 }
    ],
    tasks: [
      { title: 'Оқу бағдарламасы мен жұмыс дәптерлерін бекіту', is_completed: false },
      { title: 'Ашық есік күні мен тегін диагностикалық тест ұйымдастыру', is_completed: false }
    ]
  },
  salon: {
    title: 'Beauty Studio & Сұлулық салоны',
    industry: 'Қызмет көрсету (Beauty)',
    average_check: 8500,
    unit_cost: 1800,
    monthly_clients: 320,
    tax_regime: 'simplified_3',
    summary: 'Маникюр, кірпік өсіру, қас коррекциясы және шаш күтімі қызметтерін бір жерде (4 қолда параллель) көрсететін жайлы студия.',
    marketing_strategy: 'Instagram-да «Дейін / Кейін» портфолиосы, блогерлерге бартер арқылы қызмет көрсету, DIKIDI / Altegio онлайн-жазылу жүйесін қосу.',
    team_plan: 'Мастерлер 50/50 немесе 40/60 пайыздық жүйеде жұмыс істейді, Администратор — 180 000 ₸.',
    lean_canvas: {
      problem: 'Уақыт тапшылығы және стерильді, сапалы қызмет көрсететін салондардың аздығы.',
      solution: 'Онлайн жазылу, 1.5 сағат ішінде бірнеше процедураны қатар алу және 100% медициналық стерилизация.',
      uvp: 'Кепілдігі бар маникюр (7 күн) және клиенттерге тегін дәмді кофе/шай сервисі.',
      segments: '20-45 жас аралығындағы әйелдер.',
      channels: 'Instagram Reels, 2GIS, WhatsApp рассылка (қайта жазылуды еске салу).',
      revenue: 'Бьюти-процедуралар және кәсіби косметика сатылымы.',
      costs: 'Студия жалдау, шығын материалдары (гель-лак, бірреттік құралдар), жарнама.',
      metrics: 'Креслолардың толымдылығы (Загрузка), қайта келген клиенттер пайызы.',
      advantage: 'Жоғары сервис пен мінсіз тазалық стандарты.'
    },
    swot: {
      strengths: 'Тұрақты қайталанатын сұраныс (ай сайынғы процедуралар), жоғары орташа чек.',
      weaknesses: 'Топ-мастерлерге тәуелділік.',
      opportunities: 'Бастаушы мастерлерге арналған оқыту курстарын ашу.',
      threats: 'Үйде қабылдайтын жеке мастерлермен баға бәсекелестігі.'
    },
    finItems: [
      { category: 'capex', name: 'Маникюр үстелдері, педикюр креслолары, айналар', amount: 1900000 },
      { category: 'capex', name: 'Сухожар (стерилизация), аппараттар мен гель-лак палитрасы', amount: 1100000 },
      { category: 'opex_fixed', name: 'Студия жалдау ақысы', amount: 350000 },
      { category: 'opex_fixed', name: 'Администратор жалақысы мен CRM жүйесі', amount: 220000 },
      { category: 'opex_variable', name: 'Таргет жарнама және блогерлер', amount: 150000 }
    ],
    tasks: [
      { title: 'СЭС талаптарына сай стерилизация аймағын жабдықтау', is_completed: false },
      { title: 'Онлайн-жазылу сілтемесін Instagram парақшасына орнату', is_completed: false }
    ]
  }
}

export default function BizPlanApp() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [toast, setToast] = useState(null)

  const [plans, setPlans] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')

  const [finItems, setFinItems] = useState([])
  const [tasks, setTasks] = useState([])
  const [suppliers, setSuppliers] = useState([])

  // Симулятор ползуноктары
  const [simClientChange, setSimClientChange] = useState(0)
  const [simCheckChange, setSimCheckChange] = useState(0)

  // Формалар
  const [newFinName, setNewFinName] = useState('')
  const [newFinAmount, setNewFinAmount] = useState('')
  const [newFinCat, setNewFinCat] = useState('capex')

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDate, setNewTaskDate] = useState('')

  const [newSupName, setNewSupName] = useState('')
  const [newSupCat, setNewSupCat] = useState('Шикізат')
  const [newSupPhone, setNewSupPhone] = useState('')
  const [newSupNotes, setNewSupNotes] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

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

  const fetchPlans = async (userId) => {
    const { data } = await supabase
      .from('business_plans')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (data) setPlans(data)
  }

  const openPlan = async (plan) => {
    setActivePlan(plan)
    setActiveTab('summary')
    setSimClientChange(0)
    setSimCheckChange(0)
    const [finRes, taskRes, supRes] = await Promise.all([
      supabase.from('financial_items').select('*').eq('plan_id', plan.id).order('created_at'),
      supabase.from('roadmap_tasks').select('*').eq('plan_id', plan.id).order('created_at'),
      supabase.from('suppliers').select('*').eq('plan_id', plan.id).order('created_at')
    ])
    setFinItems(finRes.data || [])
    setTasks(taskRes.data || [])
    setSuppliers(supRes.data || [])
  }

  const handleAuth = async (type, e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = type === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else if (type === 'signup') showToast('Тіркелу сәтті аяқталды!')
    setLoading(false)
  }

  const calculateProgress = (plan) => {
    let score = 15
    if (plan.summary?.length > 15) score += 20
    if (plan.marketing_strategy?.length > 15) score += 15
    if (plan.team_plan?.length > 15) score += 15
    if (Number(plan.average_check) > 0 && Number(plan.monthly_clients) > 0) score += 20
    if (plan.swot?.strengths?.length > 5) score += 15
    return Math.min(100, score)
  }

  // Таза жоба немесе толық толтырылған Шаблон құру
  const createFromTemplate = async (templateKey = null) => {
    setLoading(true)
    const tpl = templateKey ? TEMPLATES[templateKey] : null

    const payload = {
      user_id: session.user.id,
      title: tpl ? tpl.title : 'Жаңа Бизнес Жоба',
      industry: tpl ? tpl.industry : 'Жалпы бизнес',
      average_check: tpl ? tpl.average_check : 0,
      unit_cost: tpl ? tpl.unit_cost : 0,
      monthly_clients: tpl ? tpl.monthly_clients : 0,
      tax_regime: tpl ? tpl.tax_regime : 'simplified_3',
      summary: tpl ? tpl.summary : '',
      marketing_strategy: tpl ? tpl.marketing_strategy : '',
      team_plan: tpl ? tpl.team_plan : '',
      lean_canvas: tpl ? tpl.lean_canvas : { problem: '', solution: '', uvp: '', segments: '', channels: '', revenue: '', costs: '', metrics: '', advantage: '' },
      swot: tpl ? tpl.swot : { strengths: '', weaknesses: '', opportunities: '', threats: '' },
      progress: tpl ? 100 : 15
    }

    const { data: newPlan, error } = await supabase
      .from('business_plans')
      .insert([payload])
      .select()
      .single()

    if (!error && newPlan) {
      if (tpl?.finItems?.length) {
        await supabase.from('financial_items').insert(
          tpl.finItems.map(item => ({ ...item, plan_id: newPlan.id, user_id: session.user.id }))
        )
      }
      if (tpl?.tasks?.length) {
        await supabase.from('roadmap_tasks').insert(
          tpl.tasks.map(t => ({ ...t, plan_id: newPlan.id, user_id: session.user.id }))
        )
      }
      await fetchPlans(session.user.id)
      openPlan(newPlan)
      showToast(tpl ? `«${tpl.title}» шаблоны деректерімен бірге жүктелді!` : 'Жаңа жоба құрылды')
    }
    setLoading(false)
  }

  const deletePlan = async (id, e) => {
    if (e) e.stopPropagation()
    if (!confirm('Бұл жобаны біржола өшіруді растайсыз ба?')) return
    await supabase.from('business_plans').delete().eq('id', id)
    setPlans(plans.filter(p => p.id !== id))
    if (activePlan?.id === id) setActivePlan(null)
    showToast('Жоба өшірілді')
  }

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
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedPlan.id)

    if (!error) {
      setActivePlan({ ...updatedPlan, progress: prog })
      fetchPlans(session.user.id)
      showToast('Барлық өзгерістер бұлтқа сақталды')
    }
    setLoading(false)
  }

  const syncCanvasToSummary = () => {
    const lc = activePlan.lean_canvas || {}
    const autoSummary = `Мәселе: ${lc.problem || '-'}\nШешім: ${lc.solution || '-'}\nБірегей құндылық (УТП): ${lc.uvp || '-'}`
    const autoMarketing = `Мақсатты сегмент: ${lc.segments || '-'}\nСату арналары: ${lc.channels || '-'}\nТабыс ағындары: ${lc.revenue || '-'}`
    const updated = {
      ...activePlan,
      summary: activePlan.summary ? `${activePlan.summary}\n\n${autoSummary}` : autoSummary,
      marketing_strategy: activePlan.marketing_strategy ? `${activePlan.marketing_strategy}\n\n${autoMarketing}` : autoMarketing
    }
    setActivePlan(updated)
    savePlanChanges(updated)
  }

  const insertSampleText = (field) => {
    const samples = {
      summary: 'Біздің жоба жергілікті нарықтағы тұтынушыларға жоғары сапалы өнім мен заманауи сервис ұсынуға бағытталған. Негізгі мақсатымыз — алғашқы 6 айда тұрақты клиенттік база қалыптастырып, бастапқы инвестицияны толық ақтау.',
      marketing_strategy: '1. Instagram & TikTok: Күнделікті эксперттік және визуалды Reels түсіру, таргет жарнама қосу.\n2. 2GIS және Яндекс Карта: Карточканы толық толтыру және алғашқы 50 клиенттен пікір жинау.\n3. Серіктестік: Көршілес бизнес түрлерімен кросс-маркетинг жасау.',
      team_plan: '1. Жоба жетекшісі (Операциялық басқару және сатып алу)\n2. Сату менеджері / Маман (Клиенттермен жұмыс) — 200 000 ₸ + % бонус\n3. SMM / Маркетолог (Жобалық негізде) — 120 000 ₸'
    }
    setActivePlan({ ...activePlan, [field]: samples[field] })
    showToast('Үлгі мәтін қойылды — өз деректеріңізге сай өңдей аласыз')
  }

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
      showToast('Шығын қосылды')
    }
  }

  const deleteFinItem = async (id) => {
    await supabase.from('financial_items').delete().eq('id', id)
    setFinItems(finItems.filter(i => i.id !== id))
  }

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

  const deleteTask = async (id, e) => {
    e.stopPropagation()
    await supabase.from('roadmap_tasks').delete().eq('id', id)
    setTasks(tasks.filter(t => t.id !== id))
  }

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
      showToast('Контакт сақталды')
    }
  }

  const deleteSupplier = async (id) => {
    await supabase.from('suppliers').delete().eq('id', id)
    setSuppliers(suppliers.filter(s => s.id !== id))
  }

  // ҚАРЖЫЛЫҚ МОДЕЛЬ ЕСЕПТЕУЛЕРІ
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
  const paybackMonths = netProfit > 0 ? (totalCapex / netProfit).toFixed(1) : null
  const marginPercent = monthlyRevenue > 0 ? Math.round((netProfit / monthlyRevenue) * 100) : 0

  const marginPerClient = adjCheck - unitCost - (adjCheck * 0.0095)
  const breakEvenClients = marginPerClient > 0 ? Math.ceil((totalOpexFixed + totalOpexVar) / marginPerClient) : 0

  // 1. АВТОРИЗАЦИЯ ЭКРАНЫ (Minimalist Fintech)
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 text-zinc-100">
        <div className="bg-zinc-900/90 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-800 animate-scale-in">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold text-lg">B</div>
            <span className="text-xl font-semibold tracking-tight">BizPlan Studio</span>
          </div>
          <p className="text-zinc-400 text-center text-sm mb-8">Кәсіпкерлерге арналған бизнес-модельдеу және қаржылық аналитика ортасы</p>
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Электронды пошта</label>
              <input type="email" placeholder="name@company.kz" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:border-zinc-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Құпиясөз</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:border-zinc-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3">
              <button onClick={(e) => handleAuth('login', e)} disabled={loading} className="w-full bg-white text-zinc-950 hover:bg-zinc-200 py-2.5 rounded-xl text-sm font-semibold">Жүйеге кіру</button>
              <button onClick={(e) => handleAuth('signup', e)} disabled={loading} className="w-full bg-zinc-800 text-zinc-100 hover:bg-zinc-700 py-2.5 rounded-xl text-sm font-medium border border-zinc-700">Тіркелу</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const cardClass = darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200/80 text-zinc-900 shadow-xs'
  const inputClass = darkMode
    ? 'bg-zinc-950/70 border-zinc-800 text-zinc-100 focus:border-zinc-600'
    : 'bg-zinc-50/70 border-zinc-200 text-zinc-900 focus:bg-white focus:border-zinc-400'

  // Dashboard жалпы аналитикасы
  const totalPortfolioRevenue = plans.reduce((acc, p) => acc + ((Number(p.average_check) || 0) * (Number(p.monthly_clients) || 0)), 0)
  const avgPortfolioProgress = plans.length > 0 ? Math.round(plans.reduce((acc, p) => acc + (p.progress || 15), 0) / plans.length) : 0

  // 2. ЖЕКЕ КАБИНЕТ (DASHBOARD)
  if (!activePlan) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-[#F8FAFC] text-zinc-900'}`}>
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-lg border border-zinc-700 flex items-center gap-2.5 text-sm animate-scale-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toast}</span>
          </div>
        )}

        {/* Топ-навигация */}
        <header className={`border-b px-8 py-4 flex justify-between items-center ${darkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200/80'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${darkMode ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'}`}>B</div>
            <div>
              <span className="font-semibold tracking-tight text-sm">BizPlan Studio</span>
              <span className="mx-2 text-zinc-300 dark:text-zinc-700">/</span>
              <span className="text-xs text-zinc-500">{session.user.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg border ${darkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-zinc-200 hover:bg-zinc-100'}`}>
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>
            <button onClick={() => supabase.auth.signOut()} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium ${darkMode ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'}`}>
              <LogOut className="w-3.5 h-3.5" /> Шығу
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-8 py-8 animate-fade-up">
          {/* KPI Аналитика Виджеттері */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className={`p-5 rounded-2xl border ${cardClass}`}>
              <div className="flex justify-between items-center text-xs text-zinc-500 mb-2">
                <span>Белсенді бизнес-жобалар</span>
                <Briefcase className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold tabular-nums">{plans.length} жоба</div>
            </div>
            <div className={`p-5 rounded-2xl border ${cardClass}`}>
              <div className="flex justify-between items-center text-xs text-zinc-500 mb-2">
                <span>Болжамды жалпы айлық айналым</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold tabular-nums">{totalPortfolioRevenue.toLocaleString()} ₸<span className="text-xs font-normal text-zinc-400"> / ай</span></div>
            </div>
            <div className={`p-5 rounded-2xl border ${cardClass}`}>
              <div className="flex justify-between items-center text-xs text-zinc-500 mb-2">
                <span>Орташа дайындық деңгейі</span>
                <Layers className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold tabular-nums">{avgPortfolioProgress}%</div>
            </div>
          </div>

          {/* Дайын шаблондар панелі */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Жаңа жоба құру немесе дайын бизнес-модельді жүктеу</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => createFromTemplate(null)}
                disabled={loading}
                className={`p-4 rounded-xl flex flex-col justify-between text-left transition group ${darkMode ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
              >
                <Plus className="w-5 h-5 mb-3" />
                <div>
                  <div className="text-sm font-semibold">Таза жоба</div>
                  <div className="text-[11px] opacity-70">Нөлден бастап құру</div>
                </div>
              </button>

              {[
                { key: 'coffee', title: 'Кофехана', sub: 'Чек 1800 ₸ • HoReCa' },
                { key: 'store', title: 'Дүкен / Маркет', sub: 'Чек 2500 ₸ • Сауда' },
                { key: 'edu', title: 'Оқу орталығы', sub: 'Чек 35 000 ₸ • Курстар' },
                { key: 'salon', title: 'Сұлулық салоны', sub: 'Чек 8500 ₸ • Қызмет' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => createFromTemplate(t.key)}
                  disabled={loading}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition ${cardClass}`}
                >
                  <div className="flex justify-between items-center w-full mb-3">
                    <Sparkles className="w-4 h-4 text-zinc-400" />
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium">Дайын есеп</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.title}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{t.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Жобалар тізімі */}
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Менің жобаларым</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map(plan => {
              const estRev = (Number(plan.average_check) || 0) * (Number(plan.monthly_clients) || 0)
              return (
                <div
                  key={plan.id}
                  onClick={() => openPlan(plan)}
                  className={`p-6 rounded-2xl border cursor-pointer group hover:border-zinc-400 dark:hover:border-zinc-600 transition flex flex-col justify-between ${cardClass}`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                        {plan.industry}
                      </span>
                      <button
                        onClick={(e) => deletePlan(plan.id, e)}
                        title="Жобаны өшіру"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight mt-3">{plan.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {plan.summary || 'Жоба сипаттамасы әлі толтырылмаған...'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex justify-between items-center text-xs mb-3">
                      <span className="text-zinc-400">Болжамды айналым:</span>
                      <span className="font-semibold tabular-nums">{estRev > 0 ? `${estRev.toLocaleString()} ₸/ай` : 'Есептелмеген'}</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-3">
                      <div className={`h-full rounded-full ${darkMode ? 'bg-white' : 'bg-zinc-900'}`} style={{ width: `${plan.progress || 15}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-zinc-400">
                      <span>Дайындығы: {plan.progress || 15}%</span>
                      <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-200 group-hover:translate-x-0.5 transition">
                        Ашу <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Навигация тізімі
  const NAV_ITEMS = [
    { id: 'summary', label: 'Түйіндеме & Маркетинг', icon: FileText },
    { id: 'ideas', label: 'Идеялар & Lean Canvas', icon: Lightbulb },
    { id: 'swot', label: 'SWOT & Команда', icon: Target },
    { id: 'finance', label: 'Қаржы & Симулятор', icon: Calculator },
    { id: 'roadmap', label: 'Іске асыру чек-листі', icon: CheckSquare },
    { id: 'suppliers', label: 'Жеткізушілер базасы', icon: Truck },
    { id: 'preview', label: 'Толық есеп (PDF Preview)', icon: Eye },
  ]

  const currentTabIndex = NAV_ITEMS.findIndex(i => i.id === activeTab)
  const nextTab = NAV_ITEMS[currentTabIndex + 1]

  // 3. ЖОБА КОНСТРУКТОРЫ (SPLIT-SCREEN SIDEBAR WORKSPACE)
  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-[#F8FAFC] text-zinc-900'}`}>
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-lg border border-zinc-700 flex items-center gap-2.5 text-sm animate-scale-in print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* СОЛ ЖАҚ БҮЙІРЛІК ПАНЕЛЬ (SIDEBAR) */}
      <aside className={`w-64 border-r flex flex-col justify-between shrink-0 sticky top-0 h-screen print:hidden animate-slide-right ${darkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200/80'}`}>
        <div className="p-5">
          <button
            onClick={() => setActivePlan(null)}
            className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Барлық жобаларға қайту
          </button>

          <div className="mb-6">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Ағымдағы жоба</span>
            <input
              value={activePlan.title}
              onChange={e => setActivePlan({ ...activePlan, title: e.target.value })}
              className="w-full font-bold text-base bg-transparent border-b border-transparent focus:border-zinc-400 outline-none mt-1 pb-1"
            />
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
              <span>Толтырылуы</span>
              <span className="font-semibold tabular-nums">{activePlan.progress || 15}%</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden mt-1">
              <div className={`h-full ${darkMode ? 'bg-white' : 'bg-zinc-900'}`} style={{ width: `${activePlan.progress || 15}%` }} />
            </div>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? (darkMode ? 'bg-white text-zinc-950 font-semibold' : 'bg-zinc-900 text-white font-semibold shadow-xs')
                      : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar төменгі қаржылық мини-сводкасы */}
        <div className="p-4 m-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 text-xs space-y-1.5">
          <div className="text-[10px] font-semibold uppercase text-zinc-400">Жедел есеп</div>
          <div className="flex justify-between">
            <span className="text-zinc-500">CAPEX:</span>
            <span className="font-semibold tabular-nums">{totalCapex.toLocaleString()} ₸</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Таза пайда:</span>
            <span className={`font-semibold tabular-nums ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {Math.round(netProfit).toLocaleString()} ₸
            </span>
          </div>
        </div>
      </aside>

      {/* ОҢ ЖАҚ НЕГІЗГІ ЖҰМЫС АЙМАҒЫ (WORKSPACE) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Жоғарғы панель */}
        <header className={`border-b px-8 py-3.5 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md print:hidden ${darkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-zinc-200/80'}`}>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Жобалар</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-700 dark:text-zinc-200 font-medium">{activePlan.title}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-500">{NAV_ITEMS.find(i => i.id === activeTab)?.label}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg border ${darkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-zinc-200 hover:bg-zinc-100'}`}>
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>
            <button
              onClick={() => { setActiveTab('preview'); setTimeout(() => window.print(), 300) }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium ${darkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-zinc-200 bg-white hover:bg-zinc-50'}`}
            >
              <Printer className="w-3.5 h-3.5" /> PDF жүктеу
            </button>
            <button
              onClick={() => savePlanChanges()}
              disabled={loading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold ${darkMode ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
            >
              <Save className="w-3.5 h-3.5" /> {loading ? 'Сақталуда...' : 'Сақтау'}
            </button>
          </div>
        </header>

        <main className="max-w-4xl w-full mx-auto px-8 py-8 flex-1">
          {/* 1. ТҮЙІНДЕМЕ ЖӘНЕ МАРКЕТИНГ */}
          {activeTab === 'summary' && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Жоба түйіндемесі және Маркетинг</h1>
                <p className="text-xs text-zinc-500 mt-1">Бизнес-жоспардың негізгі паспорты мен клиент тарту стратегиясы</p>
              </div>

              <div className={`p-6 rounded-2xl border space-y-5 ${cardClass}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Бизнес саласы</label>
                    <input value={activePlan.industry || ''} onChange={e => setActivePlan({ ...activePlan, industry: e.target.value })} className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-none ${inputClass}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Жоба мәртебесі</label>
                    <select value={activePlan.status || 'draft'} onChange={e => setActivePlan({ ...activePlan, status: e.target.value })} className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-none ${inputClass}`}>
                      <option value="draft">Жасалуда (Draft)</option>
                      <option value="completed">Толық дайын (Completed)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Жоба түйіндемесі (Executive Summary & Миссиясы)</label>
                    <button onClick={() => insertSampleText('summary')} className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                      <Sparkles className="w-3 h-3" /> Үлгі мәтін қою
                    </button>
                  </div>
                  <textarea rows={5} value={activePlan.summary || ''} onChange={e => setActivePlan({ ...activePlan, summary: e.target.value })} placeholder="Бизнестің негізгі мәні, кімге арналған және қандай мәселені шешеді..." className={`w-full p-3.5 rounded-xl border text-sm leading-relaxed resize-none outline-none ${inputClass}`} />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Маркетинг және Сату стратегиясы (Instagram, TikTok, 2GIS)</label>
                    <button onClick={() => insertSampleText('marketing_strategy')} className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                      <Sparkles className="w-3 h-3" /> Үлгі мәтін қою
                    </button>
                  </div>
                  <textarea rows={5} value={activePlan.marketing_strategy || ''} onChange={e => setActivePlan({ ...activePlan, marketing_strategy: e.target.value })} placeholder="Клиенттерді қайдан және қалай тартамыз? Жарнама арналары мен акциялар..." className={`w-full p-3.5 rounded-xl border text-sm leading-relaxed resize-none outline-none ${inputClass}`} />
                </div>
              </div>
            </div>
          )}

          {/* 2. ИДЕЯЛАР ЖӘНЕ LEAN CANVAS */}
          {activeTab === 'ideas' && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Идеялар банкі & Lean Canvas</h1>
                  <p className="text-xs text-zinc-500 mt-1">Жобаның 1 беттік визуалды бизнес-моделі мен гипотезалар блокноты</p>
                </div>
                <button onClick={syncCanvasToSummary} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border ${ cardClass } hover:border-zinc-400`}>
                  <RefreshCw className="w-3.5 h-3.5" /> Түйіндемеге авто-көшіру
                </button>
              </div>

              <div className={`p-5 rounded-2xl border ${cardClass}`}>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Еркін идеялар мен жазбалар блокноты</label>
                <textarea rows={3} value={activePlan.idea_notes || ''} onChange={e => setActivePlan({ ...activePlan, idea_notes: e.target.value })} placeholder="Ойға келген кез келген қосымша идеяларды, жаңа өнім түрлерін немесе маркетингтік фишкаларды осында түртіп қойыңыз..." className={`w-full p-3 rounded-xl border text-sm resize-none outline-none ${inputClass}`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {[
                  { key: 'problem', title: '1. Клиенттің мәселесі' },
                  { key: 'solution', title: '2. Шешім (Өнім/Қызмет)' },
                  { key: 'uvp', title: '3. Бірегей ұсыныс (УТП)' },
                  { key: 'segments', title: '4. Клиенттер сегменті' },
                  { key: 'channels', title: '5. Сату арналары' },
                  { key: 'revenue', title: '6. Табыс көздері' },
                  { key: 'costs', title: '7. Шығындар құрылымы' },
                  { key: 'metrics', title: '8. Негізгі метрикалар' },
                  { key: 'advantage', title: '9. Жасырын артықшылық' },
                ].map(item => (
                  <div key={item.key} className={`p-4 rounded-2xl border ${cardClass}`}>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">{item.title}</label>
                    <textarea
                      rows={3}
                      value={activePlan.lean_canvas?.[item.key] || ''}
                      onChange={e => setActivePlan({
                        ...activePlan,
                        lean_canvas: { ...activePlan.lean_canvas, [item.key]: e.target.value }
                      })}
                      className={`w-full p-2.5 text-xs rounded-xl border resize-none outline-none leading-relaxed ${inputClass}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. SWOT ЖӘНЕ КОМАНДА */}
          {activeTab === 'swot' && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h1 className="text-xl font-bold tracking-tight">SWOT-талдау және Команда</h1>
                <p className="text-xs text-zinc-500 mt-1">Ішкі/сыртқы факторларды бағалау және штаттық кесте</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'strengths', title: 'Күшті жақтары (Strengths)', badge: 'Ішкі оң фактор', dot: 'bg-emerald-500' },
                  { key: 'weaknesses', title: 'Әлсіз жақтары (Weaknesses)', badge: 'Ішкі осалдық', dot: 'bg-rose-500' },
                  { key: 'opportunities', title: 'Мүмкіндіктер (Opportunities)', badge: 'Нарық әлеуеті', dot: 'bg-blue-500' },
                  { key: 'threats', title: 'Қауіптер мен Тәуекелдер (Threats)', badge: 'Сыртқы қауіп', dot: 'bg-amber-500' },
                ].map(s => (
                  <div key={s.key} className={`p-5 rounded-2xl border ${cardClass}`}>
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                        <span className="text-xs font-bold">{s.title}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">{s.badge}</span>
                    </div>
                    <textarea
                      rows={4}
                      value={activePlan.swot?.[s.key] || ''}
                      onChange={e => setActivePlan({ ...activePlan, swot: { ...activePlan.swot, [s.key]: e.target.value } })}
                      className={`w-full p-3 rounded-xl border text-xs leading-relaxed resize-none outline-none ${inputClass}`}
                    />
                  </div>
                ))}
              </div>

              <div className={`p-6 rounded-2xl border ${cardClass}`}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-zinc-500">Ұйымдастыру жоспары және Команда (Штат кестесі мен жалақы)</label>
                  <button onClick={() => insertSampleText('team_plan')} className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                    <Sparkles className="w-3 h-3" /> Үлгі мәтін қою
                  </button>
                </div>
                <textarea rows={4} value={activePlan.team_plan || ''} onChange={e => setActivePlan({ ...activePlan, team_plan: e.target.value })} placeholder="Қызметкерлер тізімі, міндеттері және айлық еңбекақы қоры..." className={`w-full p-3.5 rounded-xl border text-sm resize-none outline-none ${inputClass}`} />
              </div>
            </div>
          )}

          {/* 4. ҚАРЖЫ, САЛЫҚ ЖӘНЕ СИМУЛЯТОР */}
          {activeTab === 'finance' && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Қаржылық модель және Сценарийлер симуляторы</h1>
                <p className="text-xs text-zinc-500 mt-1">CAPEX, OPEX, Unit-экономика және ҚР салық режимі бойынша автоматты калькулятор</p>
              </div>

              {/* 5 негізгі метрика (Bento Grid) */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className={`p-4 rounded-2xl border ${cardClass}`}>
                  <span className="text-[11px] text-zinc-400">Инвестиция (CAPEX)</span>
                  <p className="text-base font-bold tabular-nums mt-1">{totalCapex.toLocaleString()} ₸</p>
                </div>
                <div className={`p-4 rounded-2xl border ${cardClass}`}>
                  <span className="text-[11px] text-zinc-400">Айлық айналым</span>
                  <p className="text-base font-bold tabular-nums mt-1">{monthlyRevenue.toLocaleString()} ₸</p>
                </div>
                <div className={`p-4 rounded-2xl border ${cardClass}`}>
                  <span className="text-[11px] text-zinc-400">Таза пайда (Айына)</span>
                  <p className={`text-base font-bold tabular-nums mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {Math.round(netProfit).toLocaleString()} ₸
                  </p>
                </div>
                <div className={`p-4 rounded-2xl border ${cardClass}`}>
                  <span className="text-[11px] text-zinc-400">Залалсыздық нүктесі</span>
                  <p className="text-base font-bold tabular-nums mt-1">{breakEvenClients} чек</p>
                </div>
                <div className={`p-4 rounded-2xl border ${cardClass}`}>
                  <span className="text-[11px] text-zinc-400">Өзін-өзі ақтау (ROI)</span>
                  <p className="text-base font-bold tabular-nums mt-1">{paybackMonths ? `${paybackMonths} ай` : 'Минус'}</p>
                </div>
              </div>

              {/* Unit-экономика енгізу өрістері */}
              <div className={`p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-4 gap-4 ${cardClass}`}>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Орташа чек (1 сатылым, ₸)</label>
                  <input type="number" value={activePlan.average_check || ''} onChange={e => setActivePlan({ ...activePlan, average_check: e.target.value })} className={`w-full px-3 py-2 rounded-xl border text-sm tabular-nums outline-none ${inputClass}`} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Өзіндік құн (Unit Cost, ₸)</label>
                  <input type="number" value={activePlan.unit_cost || ''} onChange={e => setActivePlan({ ...activePlan, unit_cost: e.target.value })} className={`w-full px-3 py-2 rounded-xl border text-sm tabular-nums outline-none ${inputClass}`} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Айлық клиенттер (чек) саны</label>
                  <input type="number" value={activePlan.monthly_clients || ''} onChange={e => setActivePlan({ ...activePlan, monthly_clients: e.target.value })} className={`w-full px-3 py-2 rounded-xl border text-sm tabular-nums outline-none ${inputClass}`} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">ҚР Салық режимі</label>
                  <select value={activePlan.tax_regime || 'simplified_3'} onChange={e => setActivePlan({ ...activePlan, tax_regime: e.target.value })} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${inputClass}`}>
                    <option value="simplified_3">Оңайлатылған (3%)</option>
                    <option value="retail_4">Бөлшек салық (4%)</option>
                    <option value="general">Жалпы режим (10%)</option>
                  </select>
                </div>
              </div>

              {/* Шығындар мен Пайда құрылымының визуалды диаграммасы */}
              {monthlyRevenue > 0 && (
                <div className={`p-5 rounded-2xl border ${cardClass}`}>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-semibold">Айлық түсімнің бөлінісі (Рентабельділік: {marginPercent}%)</span>
                    <span className="text-zinc-400 tabular-nums">Салық: {Math.round(taxAmount).toLocaleString()} ₸ • Kaspi QR: {Math.round(kaspiFee).toLocaleString()} ₸</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
                    <div style={{ width: `${Math.min(100, (monthlyCOGS / monthlyRevenue) * 100)}%` }} className="bg-zinc-400" title="Өзіндік құн" />
                    <div style={{ width: `${Math.min(100, ((totalOpexFixed + totalOpexVar) / monthlyRevenue) * 100)}%` }} className="bg-amber-500" title="OPEX шығындар" />
                    <div style={{ width: `${Math.min(100, ((taxAmount + kaspiFee) / monthlyRevenue) * 100)}%` }} className="bg-blue-500" title="Салық және эквайринг" />
                    {netProfit > 0 && <div style={{ width: `${Math.max(0, (netProfit / monthlyRevenue) * 100)}%` }} className="bg-emerald-500" title="Таза пайда" />}
                  </div>
                  <div className="flex flex-wrap gap-4 text-[11px] text-zinc-500 mt-2.5">
                    <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-zinc-400 inline-block" /> Өзіндік құн: {monthlyCOGS.toLocaleString()} ₸</span>
                    <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Тұрақты/Айнымалы OPEX: {(totalOpexFixed + totalOpexVar).toLocaleString()} ₸</span>
                    <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Салық + Kaspi: {Math.round(taxAmount + kaspiFee).toLocaleString()} ₸</span>
                    <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Таза пайда: {Math.round(netProfit).toLocaleString()} ₸</span>
                  </div>
                </div>
              )}

              {/* What-If Сценарийлер симуляторы */}
              <div className={`p-5 rounded-2xl border ${cardClass}`}>
                <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                  <div>
                    <h3 className="font-bold text-sm">«Егер... болса ше?» (What-If) Сценарийлер симуляторы</h3>
                    <p className="text-xs text-zinc-400">Клиент саны мен орташа чек өзгергенде таза пайда қалай өзгеретінін тексеріңіз</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { setSimClientChange(-30); setSimCheckChange(-10) }} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Пессимистік (-30%)</button>
                    <button onClick={() => { setSimClientChange(0); setSimCheckChange(0) }} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Базалық (0%)</button>
                    <button onClick={() => { setSimClientChange(30); setSimCheckChange(15) }} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Оптимистік (+30%)</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-500">Клиенттер санының өзгерісі:</span>
                      <span className="font-semibold tabular-nums">{simClientChange > 0 ? `+${simClientChange}%` : `${simClientChange}%`} ({adjClients} клиент)</span>
                    </div>
                    <input type="range" min="-50" max="100" step="5" value={simClientChange} onChange={e => setSimClientChange(Number(e.target.value))} className="w-full accent-zinc-900 dark:accent-white" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-500">Орташа чек өзгерісі:</span>
                      <span className="font-semibold tabular-nums">{simCheckChange > 0 ? `+${simCheckChange}%` : `${simCheckChange}%`} ({adjCheck} ₸)</span>
                    </div>
                    <input type="range" min="-50" max="100" step="5" value={simCheckChange} onChange={e => setSimCheckChange(Number(e.target.value))} className="w-full accent-zinc-900 dark:accent-white" />
                  </div>
                </div>
              </div>

              {/* CAPEX және OPEX кестесі */}
              <div className={`p-6 rounded-2xl border ${cardClass}`}>
                <h3 className="font-bold text-sm mb-4">Инвестициялық (CAPEX) және Айлық (OPEX) шығындар тізімі</h3>
                <form onSubmit={addFinancialItem} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
                  <input placeholder="Шығын атауы (мысалы: Жалдау)" value={newFinName} onChange={e => setNewFinName(e.target.value)} className={`px-3 py-2 rounded-xl border text-xs outline-none ${inputClass}`} />
                  <input type="number" placeholder="Сомасы (₸)" value={newFinAmount} onChange={e => setNewFinAmount(e.target.value)} className={`px-3 py-2 rounded-xl border text-xs outline-none ${inputClass}`} />
                  <select value={newFinCat} onChange={e => setNewFinCat(e.target.value)} className={`px-3 py-2 rounded-xl border text-xs outline-none ${inputClass}`}>
                    <option value="capex">Бастапқы инвестиция (CAPEX)</option>
                    <option value="opex_fixed">Айлық тұрақты шығын (OPEX)</option>
                    <option value="opex_variable">Айлық айнымалы шығын</option>
                  </select>
                  <button type="submit" className={`rounded-xl text-xs font-semibold py-2 px-4 ${darkMode ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'}`}>+ Тізімге қосу</button>
                </form>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {finItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.category === 'capex' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' : 'bg-amber-500/10 text-amber-600'}`}>
                          {item.category === 'capex' ? 'CAPEX' : 'OPEX'}
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold tabular-nums">{Number(item.amount).toLocaleString()} ₸</span>
                        <button onClick={() => deleteFinItem(item.id)} className="text-zinc-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. ЧЕК-ЛИСТ (ROADMAP) */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Іске асыру күнтізбесі (Roadmap)</h1>
                <p className="text-xs text-zinc-500 mt-1">Бизнесті ашуға дейінгі және ашқаннан кейінгі нақты қадамдар тізімі</p>
              </div>

              <div className={`p-6 rounded-2xl border ${cardClass}`}>
                <form onSubmit={addTask} className="flex gap-3 mb-6">
                  <input placeholder="Жаңа қадам қосу (мысалы: ЖК ашу, жабдыққа тапсырыс беру...)" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className={`flex-1 px-3.5 py-2 rounded-xl border text-xs outline-none ${inputClass}`} />
                  <input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} className={`px-3 py-2 rounded-xl border text-xs outline-none ${inputClass}`} />
                  <button type="submit" className={`px-5 py-2 rounded-xl text-xs font-semibold ${darkMode ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'}`}>+ Қосу</button>
                </form>

                <div className="space-y-2">
                  {tasks.map(task => (
                    <div key={task.id} onClick={() => toggleTask(task)} className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${task.is_completed ? 'opacity-50' : ''} ${inputClass}`}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={task.is_completed} readOnly className="w-4 h-4 rounded accent-zinc-900" />
                        <span className={`text-xs font-medium ${task.is_completed ? 'line-through' : ''}`}>{task.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {task.due_date && <span className="text-[11px] text-zinc-400 tabular-nums">{task.due_date}</span>}
                        <button onClick={(e) => deleteTask(task.id, e)} className="text-zinc-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. ЖЕТКІЗУШІЛЕР БАЗАСЫ */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Жеткізушілер мен Серіктестер базасы</h1>
                <p className="text-xs text-zinc-500 mt-1">Шикізат, тауар және жабдық жеткізушілердің байланыс деректері мен баға шарттары</p>
              </div>

              <div className={`p-6 rounded-2xl border ${cardClass}`}>
                <form onSubmit={addSupplier} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                  <input placeholder="Компания / Аты-жөні" value={newSupName} onChange={e => setNewSupName(e.target.value)} className={`px-3 py-2 rounded-xl border text-xs outline-none ${inputClass}`} />
                  <input placeholder="Телефон / WhatsApp" value={newSupPhone} onChange={e => setNewSupPhone(e.target.value)} className={`px-3 py-2 rounded-xl border text-xs outline-none ${inputClass}`} />
                  <input placeholder="Прайс және шарттар" value={newSupNotes} onChange={e => setNewSupNotes(e.target.value)} className={`px-3 py-2 rounded-xl border text-xs outline-none ${inputClass}`} />
                  <button type="submit" className={`rounded-xl text-xs font-semibold py-2 px-4 ${darkMode ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'}`}>+ Контакт қосу</button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suppliers.map(sup => (
                    <div key={sup.id} className={`p-4 rounded-xl border flex justify-between items-start ${inputClass}`}>
                      <div>
                        <div className="font-bold text-sm">{sup.name}</div>
                        <div className="text-xs text-zinc-500 mt-1">{sup.phone}</div>
                        <div className="text-xs text-zinc-400 mt-2">{sup.price_notes}</div>
                      </div>
                      <button onClick={() => deleteSupplier(sup.id)} className="text-zinc-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. ТОЛЫҚ ЕСЕП (PDF PREVIEW - БАРЛЫҚ БӨЛІМДЕР БІР ҚҰЖАТТА) */}
          {activeTab === 'preview' && (
            <div className={`p-10 rounded-2xl border space-y-8 animate-fade-up ${cardClass}`}>
              <div className="border-b pb-6 flex justify-between items-end">
                <div>
                  <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Ресми Бизнес-Жоспар</span>
                  <h1 className="text-3xl font-bold mt-1">{activePlan.title}</h1>
                  <p className="text-sm text-zinc-500 mt-1">Саласы: {activePlan.industry}</p>
                </div>
                <button onClick={() => window.print()} className="print:hidden px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Басып шығару / PDF сақтау
                </button>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2">1. Жоба түйіндемесі</h2>
                <p className="text-sm leading-relaxed whitespace-pre-line">{activePlan.summary || '—'}</p>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2">2. Маркетинг және Сату стратегиясы</h2>
                <p className="text-sm leading-relaxed whitespace-pre-line">{activePlan.marketing_strategy || '—'}</p>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">3. Қаржылық көрсеткіштер</h2>
                <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border">
                  <div>
                    <div className="text-xs text-zinc-400">Бастапқы инвестиция</div>
                    <div className="font-bold text-base mt-0.5">{totalCapex.toLocaleString()} ₸</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Айлық айналым</div>
                    <div className="font-bold text-base mt-0.5">{monthlyRevenue.toLocaleString()} ₸</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Айлық таза пайда</div>
                    <div className="font-bold text-base mt-0.5">{Math.round(netProfit).toLocaleString()} ₸</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Өзін-өзі ақтау мерзімі</div>
                    <div className="font-bold text-base mt-0.5">{paybackMonths ? `${paybackMonths} ай` : '—'}</div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2">4. SWOT-Талдау</h2>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 border rounded-xl"><b>Күшті жақтары:</b> {activePlan.swot?.strengths || '—'}</div>
                  <div className="p-3 border rounded-xl"><b>Әлсіз жақтары:</b> {activePlan.swot?.weaknesses || '—'}</div>
                  <div className="p-3 border rounded-xl"><b>Мүмкіндіктер:</b> {activePlan.swot?.opportunities || '—'}</div>
                  <div className="p-3 border rounded-xl"><b>Қауіптер:</b> {activePlan.swot?.threats || '—'}</div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2">5. Ұйымдастыру жоспары және Команда</h2>
                <p className="text-sm leading-relaxed whitespace-pre-line">{activePlan.team_plan || '—'}</p>
              </div>
            </div>
          )}

          {/* Беттің астындағы "Келесі бөлім ->" навигациясы */}
          {nextTab && (
            <div className="mt-8 pt-6 border-t border-zinc-200/60 dark:border-zinc-800 flex justify-between items-center print:hidden">
              <span className="text-xs text-zinc-400">Барлық енгізілген деректерді «Сақтау» батырмасымен бекітіңіз</span>
              <button
                onClick={() => setActiveTab(nextTab.id)}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90"
              >
                Келесі бөлім: {nextTab.label} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
