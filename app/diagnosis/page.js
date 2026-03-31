'use client';

import { useState } from 'react';
import Link from 'next/link';

const QUESTIONS = [
  { id: 1, axis: 'E/I', text: '新しい環境に入ったとき、あなたはどちらですか？', choiceA: '積極的に周囲に話しかける', choiceB: 'まず周囲の様子を観察する' },
  { id: 2, axis: 'E/I', text: '週末の過ごし方として自然なのはどちらですか？', choiceA: '友人と外出して活動する', choiceB: '家でゆっくり一人で過ごす' },
  { id: 3, axis: 'E/I', text: 'グループ討論でのあなたのスタイルはどちらですか？', choiceA: '積極的に発言してリードする', choiceB: '考えをまとめてから発言する' },
  { id: 4, axis: 'E/I', text: 'エネルギーが回復するのはどちらですか？', choiceA: '人と会って会話や活動をしたとき', choiceB: '一人で静かな時間を過ごしたとき' },
  { id: 5, axis: 'S/N', text: '問題を解決するとき、あなたはどちらですか？', choiceA: '過去の実績や具体的な方法を参考にする', choiceB: '直感やアイデアで新しい方法を試みる' },
  { id: 6, axis: 'S/N', text: '情報を集めるとき、重視するのはどちらですか？', choiceA: '具体的な事実やデータ', choiceB: '全体的なパターンや意味' },
  { id: 7, axis: 'S/N', text: '日常生活でより意識するのはどちらですか？', choiceA: '現在の具体的な出来事や状況', choiceB: '将来の可能性や抽象的なアイデア' },
  { id: 8, axis: 'S/N', text: '趣味や読書の好みはどちらですか？', choiceA: '実用的・現実的な内容', choiceB: '理論的・哲学的・想像力豊かな内容' },
  { id: 9, axis: 'T/F', text: '重要な決断をするとき、あなたはどちらですか？', choiceA: '論理的な分析と客観的な基準を重視する', choiceB: '関係する人の気持ちや価値観を重視する' },
  { id: 10, axis: 'T/F', text: '友人が悩みを相談してきたとき、あなたはどちらですか？', choiceA: '原因を分析して解決策を提案する', choiceB: 'まず気持ちに共感して話を聞く' },
  { id: 11, axis: 'T/F', text: '仕事やプロジェクトで何を評価しますか？', choiceA: '効率・成果・公平性', choiceB: 'チームの士気・調和・個人への配慮' },
  { id: 12, axis: 'T/F', text: '意見の対立が起きたとき、あなたはどちらですか？', choiceA: '論理的に正しい側が優先されるべき', choiceB: 'お互いの気持ちを尊重して妥協点を探す' },
  { id: 13, axis: 'J/P', text: '予定の立て方はどちらですか？', choiceA: '事前にしっかり計画を立て、その通りに実行したい', choiceB: '流れに任せて柔軟に対応したい' },
  { id: 14, axis: 'J/P', text: '締め切りへの対応はどちらですか？', choiceA: '余裕を持って早めに終わらせる', choiceB: '締め切り直前に集中して仕上げる' },
  { id: 15, axis: 'J/P', text: '生活空間や作業環境はどちらですか？', choiceA: '整理整頓されていないと落ち着かない', choiceB: '多少散らかっていても気にしない' },
  { id: 16, axis: 'J/P', text: '仕事の進め方はどちらですか？', choiceA: '一つのことを完結させてから次に進む', choiceB: '複数のことを同時並行で進める' },
];

const DISCLAIMER = `※ この診断は参考用の簡易テストです。公式のMBTI診断（Myers-Briggs Type Indicator®）とは異なります。正確なタイプを知るには資格保持者によるフィードバックセッションを受けることを推奨します。`;

export default function DiagnosisPage() {
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentQ = answers.length;
  const question = QUESTIONS[currentQ];

  async function handleAnswer(choice) {
    const next = [...answers, choice];
    setAnswers(next);

    if (next.length === 16) {
      setLoading(true);
      const res = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: next }),
      });
      const data = await res.json();
      setResult(data);
      setLoading(false);
    }
  }

  function handleRestart() {
    setAnswers([]);
    setResult(null);
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4 animate-pulse">🧠</div>
        <p style={{ color: 'var(--text-secondary)' }}>診断中...</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center">診断結果</h1>

        <div
          className="p-8 rounded-xl border text-center space-y-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="text-5xl font-bold" style={{ color: 'var(--accent)' }}>
            {result.type}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            得点内訳: {result.scoreBreakdown}
          </p>
          <p className="mt-4">{result.summary}</p>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline"
            style={{ color: 'var(--accent)' }}
          >
            参考: {result.url}
          </a>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href={`/types/${result.type}`}
            className="px-6 py-3 rounded-lg font-medium text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            このタイプを詳しく調べる
          </Link>
          <button
            onClick={handleRestart}
            className="px-6 py-3 rounded-lg font-medium border cursor-pointer"
            style={{ borderColor: 'var(--border)' }}
          >
            もう一度診断する
          </button>
        </div>

        <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
          {DISCLAIMER}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">MBTI診断</h1>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {currentQ + 1} / 16
        </span>
      </div>

      <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQ) / 16) * 100}%`,
            backgroundColor: 'var(--accent)',
          }}
        />
      </div>

      <div
        className="p-6 rounded-xl border space-y-4"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
          質問 {question.id} / 16 ({question.axis})
        </div>
        <p className="text-lg font-medium">{question.text}</p>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => handleAnswer('A')}
            className="w-full text-left p-4 rounded-lg border transition-all hover:scale-[1.01] cursor-pointer"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
          >
            <span className="font-semibold mr-2" style={{ color: 'var(--accent)' }}>A.</span>
            {question.choiceA}
          </button>
          <button
            onClick={() => handleAnswer('B')}
            className="w-full text-left p-4 rounded-lg border transition-all hover:scale-[1.01] cursor-pointer"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
          >
            <span className="font-semibold mr-2" style={{ color: 'var(--accent)' }}>B.</span>
            {question.choiceB}
          </button>
        </div>
      </div>

      {currentQ > 0 && (
        <button
          onClick={() => setAnswers(answers.slice(0, -1))}
          className="text-sm underline cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
        >
          前の質問に戻る
        </button>
      )}
    </div>
  );
}
