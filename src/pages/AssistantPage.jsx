import { Bot, FileSearch, Send, ShieldAlert, Sparkles, WandSparkles } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '../components/ui'

export default function AssistantPage() {
  const [messages, setMessages] = useState([{ from: 'ai', text: 'Bonjour ! Je peux vous aider à analyser un dossier, résumer une offre ou expliquer un signal de risque. Que souhaitez-vous examiner ?' }])
  const [text, setText] = useState('')
  const send = (event) => { event.preventDefault(); if (!text.trim()) return; const question = text; setMessages([...messages, { from: 'user', text: question }, { from: 'ai', text: 'D’après les données de démonstration, le dossier est complet à 94 %. Le point principal à vérifier est la date de validité du quitus fiscal. Cette réponse doit être confirmée par la commission.' }]); setText('') }
  return (
    <>
      <PageHeader eyebrow="ASSISTANCE INTELLIGENTE" title="Assistant IA" description="Interrogez vos dossiers et obtenez des synthèses explicables en quelques secondes." />
      <div className="assistant-layout"><aside><div className="assistant-new"><Sparkles size={19} /><span><b>Nouvelle analyse</b><small>Conversation vierge</small></span></div><b>Actions rapides</b>{[[FileSearch,'Résumer une offre'],[ShieldAlert,'Analyser les risques'],[WandSparkles,'Comparer deux dossiers']].map(([Icon,label]) => <button key={label} type="button"><Icon size={18} />{label}</button>)}<div className="assistant-privacy"><ShieldAlert size={18} /><p><b>Données protégées</b><small>Les réponses utilisent uniquement les données auxquelles votre rôle donne accès.</small></p></div></aside><section className="chat"><div className="chat__messages">{messages.map((message,index) => <div className={`message message--${message.from}`} key={index}>{message.from === 'ai' && <span><Bot size={19} /></span>}<p>{message.text}</p></div>)}</div><div className="suggestions">{['Résume le dossier AO-2026-0042','Quelles offres sont à risque ?','Compare les scores fournisseurs'].map((item) => <button key={item} onClick={() => setText(item)} type="button">{item}</button>)}</div><form className="chat__input" onSubmit={send}><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Posez une question sur vos marchés..." /><button type="submit"><Send size={18} /></button><small>L’IA peut commettre des erreurs. Vérifiez les informations importantes.</small></form></section></div>
    </>
  )
}
