import { Bot, FileSearch, Send, ShieldAlert, Sparkles, WandSparkles } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '../components/ui'
import { api } from '../api/client'

export default function AssistantPage() {
  const [messages, setMessages] = useState([{ from: 'ai', text: 'Bonjour. Posez-moi une question générale. Je ne consulte pas directement les dossiers privés de la plateforme.' }])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const send = async (event) => {
    event.preventDefault()
    const question = text.trim()
    if (!question || loading) return
    setMessages((current) => [...current, { from: 'user', text: question }])
    setText(''); setError(''); setLoading(true)
    try {
      const result = await api.post('/ai/chatbot', { question })
      setMessages((current) => [...current, { from: 'ai', text: result.answer, engine: result.engine, reason: result.reason }])
    } catch (requestError) {
      setError(requestError.message)
    } finally { setLoading(false) }
  }
  return (
    <>
      <PageHeader eyebrow="ASSISTANCE INTELLIGENTE" title="Assistant IA" description="Posez une question générale en langage naturel. L’assistant ne consulte pas les dossiers privés de la plateforme." />
      <div className="assistant-layout"><aside><div className="assistant-new"><Sparkles size={19} /><span><b>Nouvelle conversation</b><small>Questions libres activées</small></span></div><b>Exemples</b>{[[FileSearch,'Comment lire une analyse ?'],[ShieldAlert,'Que signifie une alerte ?'],[WandSparkles,'Expliquer le scoring']].map(([Icon,label]) => <button key={label} onClick={() => setText(label)} type="button"><Icon size={18} />{label}</button>)}<div className="assistant-privacy"><ShieldAlert size={18} /><p><b>Données protégées</b><small>Les questions générales sont acceptées. Pour des réponses libres, configurez GEMINI_API_KEY dans le service IA. Les dossiers privés restent inaccessibles.</small></p></div></aside><section className="chat"><div className="chat__messages">{messages.map((message,index) => <div className={`message message--${message.from}`} key={index}>{message.from === 'ai' && <span><Bot size={19} /></span>}<p>{message.text}{message.engine && <small className="assistant-engine">{message.engine === 'Gemini-LLM' ? 'Réponse Gemini' : message.reason === 'gemini_unavailable' ? 'Mode de secours · Gemini indisponible' : message.reason === 'ai_service_unreachable' ? 'Mode de secours · service IA injoignable' : 'Mode de secours · configurez Gemini pour les questions libres'}</small>}</p></div>)}{loading && <p role="status">Réponse en cours…</p>}</div><div className="suggestions">{['Comment puis-je préparer une offre ?', 'Pourquoi le score reste-t-il vide ?', 'Comment interpréter un risque élevé ?'].map((item) => <button key={item} onClick={() => setText(item)} type="button">{item}</button>)}</div>{error && <p className="authority-inline-error" role="alert">{error}</p>}<form className="chat__input" onSubmit={send}><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Posez une question..." /><button disabled={loading} type="submit"><Send size={18} /></button><small>La réponse est générale et ne remplace pas le règlement de consultation.</small></form></section></div>
    </>
  )
}
