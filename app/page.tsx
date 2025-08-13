
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardBody, Button, Badge, Input, Textarea, Select } from '@/components/ui'

type Report = {
  id: string
  date: string
  author: string
  text: string
}
type Task = {
  id: string
  title: string
  description?: string
  assignee: string
  creator: string
  dueDate?: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  reports: Report[]
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'workmgr_v1'
const DEFAULT_MEMBERS = ['昌哥', 'Regine', 'Ellie', 'Annie', 'Jay']

const STATUS_LABEL: Record<Task['status'], string> = {
  todo: '待辦',
  in_progress: '進行中',
  review: '待驗收',
  done: '已完成',
}
const STATUS_STYLE: Record<Task['status'], string> = {
  todo: 'bg-slate-50 text-slate-700',
  in_progress: 'bg-blue-50 text-blue-700',
  review: 'bg-amber-50 text-amber-700',
  done: 'bg-emerald-50 text-emerald-700',
}

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2,10)}`
}
function todayStr() {
  const tzOffset = new Date().getTimezoneOffset()
  const d = new Date(Date.now() - tzOffset * 60000)
  return d.toISOString().slice(0,10)
}

export default function Page(){
  const [members, setMembers] = useState<string[]>(DEFAULT_MEMBERS)
  const [me, setMe] = useState('昌哥')
  const [tasks, setTasks] = useState<Task[]>([])
  const [filterAssignee, setFilterAssignee] = useState('all')
  const [keyword, setKeyword] = useState('')

  useEffect(()=>{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(raw){
      try{
        const parsed = JSON.parse(raw) as { members: string[]; me: string; tasks: Task[] }
        setMembers(parsed.members?.length ? parsed.members : DEFAULT_MEMBERS)
        setMe(parsed.me || '昌哥')
        setTasks(parsed.tasks || [])
      }catch{}
    }else{
      const demo: Task = {
        id: uid('task'),
        title: '建立活動主視覺（父親節 Style C）',
        description: '依公司設計守則，含神歐迷角色、保留淡格紋、1080x1080 版本',
        assignee: 'Ellie',
        creator: '昌哥',
        dueDate: todayStr(),
        status: 'in_progress',
        reports: [{ id: uid('r'), date: todayStr(), author: 'Ellie', text: '完成 60%，明天提交初稿。' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setTasks([demo])
    }
  },[])

  useEffect(()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify({members, me, tasks}))
  },[members, me, tasks])

  const filtered = useMemo(()=>{
    return tasks.filter(t=>{
      const assigneeOk = filterAssignee==='all' || t.assignee===filterAssignee
      const textOk = keyword.trim() ? (t.title + ' ' + (t.description||'') + ' ' + t.assignee).toLowerCase().includes(keyword.toLowerCase()) : true
      return assigneeOk && textOk
    })
  },[tasks, filterAssignee, keyword])

  const grouped = useMemo(()=>{
    const g: Record<Task['status'], Task[]> = { todo: [], in_progress: [], review: [], done: [] }
    for(const t of filtered) g[t.status].push(t)
    return g
  },[filtered])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Task|null>(null)
  const [form, setForm] = useState<Partial<Task>>({ title:'', description:'', assignee: members[1] || members[0], dueDate: todayStr(), status: 'todo' })

  function openCreate(){
    setEditing(null)
    setForm({ title:'', description:'', assignee: members[1] || members[0], dueDate: todayStr(), status: 'todo' })
    setDialogOpen(true)
  }
  function openEdit(t: Task){
    setEditing(t)
    setForm({ title: t.title, description: t.description, assignee: t.assignee, dueDate: t.dueDate, status: t.status })
    setDialogOpen(true)
  }
  function saveTask(){
    if(!form.title || !form.assignee) return
    if(editing){
      setTasks(prev=>prev.map(t=> t.id===editing.id ? { ...t, ...form, title: form.title!, assignee: form.assignee!, updatedAt: new Date().toISOString() } : t ))
    }else{
      const t: Task = {
        id: uid('task'),
        title: form.title!, description: form.description || '',
        assignee: form.assignee!, creator: me,
        dueDate: form.dueDate, status: (form.status as Task['status']) || 'todo',
        reports: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      }
      setTasks(prev=>[t, ...prev])
    }
    setDialogOpen(false)
  }
  function removeTask(id: string){ setTasks(prev=>prev.filter(t=>t.id!==id)) }
  function updateStatus(id: string, status: Task['status']){ setTasks(prev=>prev.map(t=> t.id===id? { ...t, status, updatedAt: new Date().toISOString() } : t )) }

  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeTask, setActiveTask] = useState<Task|null>(null)
  const [newReport, setNewReport] = useState({ date: todayStr(), author: '', text: '' })
  function openReports(t: Task){ setActiveTask(t); setNewReport({ date: todayStr(), author: me, text: ''}); setSheetOpen(true) }
  function addReport(){
    if(!activeTask || !newReport.text.trim()) return
    const r: Report = { id: uid('r'), date: newReport.date, author: newReport.author || me, text: newReport.text.trim() }
    setTasks(prev=>prev.map(t=> t.id===activeTask.id ? { ...t, reports:[r, ...t.reports], updatedAt: new Date().toISOString() } : t ))
    setNewReport({ date: todayStr(), author: me, text: '' })
  }

  const [newMember, setNewMember] = useState('')
  function addMember(){
    const name = newMember.trim()
    if(!name) return
    if(members.includes(name)) return
    setMembers(prev=>[...prev, name])
    setNewMember('')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">工作派工與日報管理</h1>
        <Badge className="ml-1">Beta</Badge>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm">我的身分</span>
          <Select value={me} onChange={setMe} className="w-36">
            {members.map(m=> <option key={m} value={m}>{m}</option>)}
          </Select>
          <Button onClick={()=>document.getElementById('member-modal')?.classList.remove('hidden')}>管理成員</Button>
          <Button className="bg-slate-900 text-white" onClick={openCreate}>新增任務</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">指派對象</span>
              <Select value={filterAssignee} onChange={setFilterAssignee} className="w-40">
                <option value="all">全部</option>
                {members.map(m=> <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Input placeholder="搜尋標題、描述、成員…" value={keyword} onChange={(e)=>setKeyword(e.target.value)} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['todo','in_progress','review','done'] as Task['status'][]).map(s=>(
          <div key={s}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold tracking-wide text-slate-700">{STATUS_LABEL[s]}</h2>
              <Badge>{grouped[s].length}</Badge>
            </div>
            {grouped[s].length===0 ? (
              <div className="text-xs text-slate-400 border border-dashed rounded-xl p-4">尚無項目</div>
            ) : (
              <div className="space-y-3">
                {grouped[s].map(t=>(
                  <Card key={t.id} className="hover:shadow-md transition">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold">{t.title}</div>
                        <Badge className={STATUS_STYLE[t.status]}>{STATUS_LABEL[t.status]}</Badge>
                      </div>
                    </CardHeader>
                    <CardBody>
                      {t.description && <div className="text-sm text-slate-700 mb-2">{t.description}</div>}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-2">
                        <Badge>指派 {t.assignee}</Badge>
                        {t.dueDate && <Badge>到期 {t.dueDate}</Badge>}
                        <Badge>報告 {t.reports.length}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={t.status} onChange={(v)=>updateStatus(t.id, v as Task['status'])} className="w-36">
                          <option value="todo">待辦</option>
                          <option value="in_progress">進行中</option>
                          <option value="review">待驗收</option>
                          <option value="done">已完成</option>
                        </Select>
                        <Button onClick={()=>openEdit(t)}>編輯</Button>
                        <Button onClick={()=>openReports(t)}>日報</Button>
                        <Button className="text-rose-600" onClick={()=>removeTask(t.id)}>刪除</Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dialog: 任務表單 */}
      {!dialogOpen ? null : (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={()=>setDialogOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl" onClick={e=>e.stopPropagation()}>
            <CardHeader><div className="text-lg font-semibold">{editing ? '編輯任務' : '新增任務'}</div></CardHeader>
            <CardBody className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm mb-1">標題</div>
                  <Input value={form.title as string} onChange={(e)=>setForm(f=>({...f, title: e.target.value}))} />
                </div>
                <div>
                  <div className="text-sm mb-1">指派給</div>
                  <Select value={(form.assignee as string)||''} onChange={(v)=>setForm(f=>({...f, assignee: v}))}>
                    {members.map(m=> <option key={m} value={m}>{m}</option>)}
                  </Select>
                </div>
              </div>
              <div>
                <div className="text-sm mb-1">描述</div>
                <Textarea rows={3} value={form.description as string} onChange={(e)=>setForm(f=>({...f, description: e.target.value}))}/>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm mb-1">到期日</div>
                  <Input type="date" value={form.dueDate as string} onChange={(e)=>setForm(f=>({...f, dueDate: e.target.value}))}/>
                </div>
                <div>
                  <div className="text-sm mb-1">狀態</div>
                  <Select value={(form.status as Task['status'])||'todo'} onChange={(v)=>setForm(f=>({...f, status: v as Task['status']}))}>
                    <option value="todo">待辦</option>
                    <option value="in_progress">進行中</option>
                    <option value="review">待驗收</option>
                    <option value="done">已完成</option>
                  </Select>
                </div>
                <div>
                  <div className="text-sm mb-1">建立者</div>
                  <Input value={me} disabled />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button onClick={()=>setDialogOpen(false)}>取消</Button>
                <Button className="bg-slate-900 text-white" onClick={saveTask}>{editing ? '儲存變更' : '建立任務'}</Button>
              </div>
            </CardBody>
          </div>
        </div>
      )}

      {/* Sheet: 日報 */}
      {!sheetOpen ? null : (
        <div className="fixed inset-0 bg-black/30 z-50" onClick={()=>setSheetOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl" onClick={(e)=>e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="text-lg font-semibold">{activeTask?.title || '日報'}</div>
              <div className="text-sm text-slate-600">{activeTask?.description}</div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm mb-1">日期</div>
                  <Input type="date" value={newReport.date} onChange={(e)=>setNewReport(r=>({...r, date: e.target.value}))}/>
                </div>
                <div>
                  <div className="text-sm mb-1">填寫人</div>
                  <Select value={newReport.author} onChange={(v)=>setNewReport(r=>({...r, author: v}))}>
                    {members.map(m=> <option key={m} value={m}>{m}</option>)}
                  </Select>
                </div>
              </div>
              <div>
                <div className="text-sm mb-1">日報內容</div>
                <Textarea rows={4} placeholder="今日進度、遇到的問題、明日規劃…" value={newReport.text} onChange={(e)=>setNewReport(r=>({...r, text: e.target.value}))}/>
              </div>
              <div className="flex justify-end">
                <Button className="bg-slate-900 text-white" onClick={addReport}>新增日報</Button>
              </div>
              <div className="pt-2">
                <div className="text-sm font-semibold mb-2">歷史日報</div>
                <div className="space-y-2 max-h-[45vh] overflow-auto pr-2">
                  {activeTask?.reports.map(r=>(
                    <Card key={r.id}>
                      <CardBody>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                          <Badge>{r.date}</Badge><Badge>{r.author}</Badge>
                        </div>
                        <div className="whitespace-pre-wrap text-sm">{r.text}</div>
                      </CardBody>
                    </Card>
                  ))}
                  {activeTask && activeTask.reports.length===0 && <div className="text-xs text-slate-400">尚無日報紀錄</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 成員管理 Modal */}
      <div id="member-modal" className="hidden fixed inset-0 bg-black/30 z-50" onClick={(e)=>{
        if(e.target === e.currentTarget) e.currentTarget.classList.add('hidden')
      }}>
        <div className="bg-white rounded-2xl w-full max-w-lg mx-auto mt-24 shadow-xl" onClick={e=>e.stopPropagation()}>
          <CardHeader><div className="text-lg font-semibold">團隊成員</div></CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2">
              <Input placeholder="輸入成員名稱" value={newMember} onChange={(e)=>setNewMember(e.target.value)} />
              <Button onClick={addMember}>新增</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {members.map(m=> <Badge key={m}>{m}</Badge>)}
            </div>
            <div className="flex justify-end">
              <Button onClick={()=>document.getElementById('member-modal')?.classList.add('hidden')}>關閉</Button>
            </div>
          </CardBody>
        </div>
      </div>

      {/* 說明 */}
      <Card className="bg-slate-50">
        <CardBody className="text-sm text-slate-700 space-y-2">
          <p>✅ <b>派工</b>：點「新增任務」，填入標題、描述、指派對象與到期日。</p>
          <p>📝 <b>日報</b>：在任務卡片點「日報」，每日由被指派同仁填寫進度。</p>
          <p>📦 <b>狀態流轉</b>：待辦 → 進行中 → 待驗收 → 已完成，可於卡片直接切換。</p>
          <p>🔎 <b>篩選</b>：可依指派對象與關鍵字快速檢索。</p>
          <p>💾 <b>儲存</b>：資料儲存在瀏覽器 <code>localStorage</code>，重新整理不會遺失。</p>
        </CardBody>
      </Card>
    </div>
  )
}
