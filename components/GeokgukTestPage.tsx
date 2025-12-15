/**
 * 격국 판단 시스템 테스트 페이지
 * 개발 중 테스트용 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { runAllTests } from '../utils/geokguk.test';

export const GeokgukTestPage: React.FC = () => {
  const [testOutput, setTestOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [testStats, setTestStats] = useState<{ pass: number; fail: number; total: number } | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestOutput('');
    setTestStats(null);

    // 콘솔 출력을 캡처
    const originalLog = console.log;
    const capturedLogs: string[] = [];

    console.log = (...args: any[]) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      capturedLogs.push(message);
      setTestOutput(prev => prev + message + '\n');
      originalLog.apply(console, args);
    };

    try {
      // 테스트 실행
      const stats = runAllTests();
      setTestStats(stats);
    } catch (e) {
      const errorMsg = `\n❌ 테스트 실행 오류: ${e instanceof Error ? e.message : String(e)}\n`;
      setTestOutput(prev => prev + errorMsg);
      console.error(e);
    } finally {
      // 원래 console.log 복원
      console.log = originalLog;
      setIsRunning(false);
    }
  };

  const clearOutput = () => {
    setTestOutput('');
    setTestStats(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 격국 판단 시스템 테스트</h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {isRunning ? '테스트 실행 중...' : '전체 테스트 실행 (50개)'}
        </button>
        <button
          onClick={clearOutput}
          disabled={isRunning}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          결과 지우기
        </button>
      </div>

      {testStats && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-lg font-semibold mb-2">📊 테스트 결과</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-green-600 font-bold">✅ 통과: {testStats.pass}개</span>
            </div>
            <div>
              <span className="text-red-600 font-bold">❌ 실패: {testStats.fail}개</span>
            </div>
            <div>
              <span className="text-gray-700 font-bold">📊 총계: {testStats.total}개</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full transition-all"
                style={{ width: `${(testStats.pass / testStats.total) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              성공률: {((testStats.pass / testStats.total) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-auto max-h-[70vh] border-2 border-gray-700">
        {testOutput === '' ? (
          <div className="text-gray-500">
            <div className="mb-4">테스트를 실행하세요...</div>
            <div className="text-xs text-gray-600">
              <div>• 총 50개의 테스트 케이스가 준비되어 있습니다</div>
              <div>• 왕지, 생지, 고지, 특수격, 합국 케이스를 포함합니다</div>
              <div>• 테스트 실행 시 상세한 결과가 표시됩니다</div>
            </div>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-words">{testOutput}</pre>
        )}
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
        <div className="font-semibold text-yellow-800 mb-2">💡 참고사항</div>
        <ul className="list-disc list-inside text-yellow-700 space-y-1">
          <li>테스트는 브라우저 콘솔에도 출력됩니다 (F12로 확인 가능)</li>
          <li>일부 테스트는 예상값이 유연할 수 있습니다 (합국 케이스 등)</li>
          <li>실패한 케이스는 상세한 비교 정보를 확인하세요</li>
        </ul>
      </div>
    </div>
  );
};

