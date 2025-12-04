/**
 * 격국(格局) 표시 컴포넌트
 *
 * 격국 설명과 확인 버튼을 제공합니다.
 */

import React, { useState } from "react";
import type { SajuInfo, GeokgukResult } from "../types";
import { analyzeGeokguk } from "../utils/gyeokguk";
import { geokgukDescriptions } from "../utils/geokgukDescriptions";
import { earthlyBranchGanInfo } from "../utils/manse";
import { allJijangganData } from "../utils/geokguk-data";

// 오행 색상 맵 (AnalysisResult와 동일)
const ohaengColorMap: Record<
  string,
  { bg: string; text: string; border?: string }
> = {
  wood: {
    bg: "bg-[#00B050]",
    text: "text-white",
    border: "border border-gray-800",
  },
  fire: {
    bg: "bg-[#FF0000]",
    text: "text-white",
    border: "border border-gray-800",
  },
  earth: {
    bg: "bg-[#FEC100]",
    text: "text-white",
    border: "border border-gray-800",
  },
  metal: {
    bg: "bg-slate-200",
    text: "text-white",
    border: "border border-gray-800",
  },
  water: {
    bg: "bg-black",
    text: "text-white",
    border: "border border-gray-800",
  },
};

interface GyeokgukDisplayProps {
  sajuInfo: SajuInfo;
}

export const GyeokgukDisplay: React.FC<GyeokgukDisplayProps> = ({
  sajuInfo,
}) => {
  const [geokgukResult, setGeokgukResult] = useState<GeokgukResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleCheckGeokguk = () => {
    setIsLoading(true);
    setShowResult(true);

    try {
      const result = analyzeGeokguk(sajuInfo);
      setGeokgukResult(result);
    } catch (e) {
      setGeokgukResult({
        판단가능: false,
        메시지: "격국 판단 중 오류가 발생했습니다",
        이유: [e instanceof Error ? e.message : "알 수 없는 오류"],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="p-6 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-2xl border-2 border-indigo-200 shadow-lg animate-fade-in glass-card">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full mb-4 animate-pulse shadow-lg">
            <span className="text-4xl">🎯</span>
          </div>
          <h4 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent mb-5">
            격국(格局)이란?
          </h4>

          <div className="max-w-4xl mx-auto space-y-4 text-left">
            <div className="bg-white/70 p-5 rounded-xl border border-indigo-200">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium">
                <strong className="text-indigo-700">격국(格局)</strong>은 "내가
                이 세상에서 어떤 도구를 써서 살아가야 가장 성공하기 쉬운지"를
                보여주는 <strong className="text-indigo-700">사회적 DNA</strong>
                입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h5 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">📌</span> 내격(內格)
                </h5>
                <p className="text-gray-700 text-sm leading-relaxed">
                  일반적인 격국으로, 월지(月支)를 기준으로 판단합니다. 정관격,
                  편관격, 정재격, 편재격, 식신격, 상관격, 정인격, 편인격,
                  건록격, 양인격 등이 있습니다.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <h5 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">⭐</span> 외격(外格, 특수격)
                </h5>
                <p className="text-gray-700 text-sm leading-relaxed">
                  특수한 조건에서 성립하는 격국입니다. 전왕격, 화기격, 종격 등이
                  있으며, 내격보다 더 강력한 기운을 가집니다.
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <h5 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <span className="text-xl">💡</span> 격국의 의미
              </h5>
              <ul className="text-gray-700 text-sm space-y-2 list-disc list-inside">
                <li>
                  <strong>정관격</strong>: 바른 관리, 정당한 권력 → 공무원,
                  정치인, 관리직
                </li>
                <li>
                  <strong>편관격(칠살격)</strong>: 무력, 강압적 권력 → 군인,
                  경찰, 무술인
                </li>
                <li>
                  <strong>정재격</strong>: 정당한 재물, 노동소득 → 직장인,
                  전문직
                </li>
                <li>
                  <strong>편재격</strong>: 유동적 재물, 투기 → 사업가, 투자자
                </li>
                <li>
                  <strong>식신격</strong>: 재능, 표현 → 예술가, 요리사, 서비스업
                </li>
                <li>
                  <strong>상관격</strong>: 비판, 창조 → 작가, 배우, 혁신가
                </li>
                <li>
                  <strong>정인격</strong>: 정통 학문 → 교수, 교사, 학자
                </li>
                <li>
                  <strong>편인격</strong>: 비주류 지식 → 연구원, 기술자
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 animate-fade-in">
            <button
              onClick={handleCheckGeokguk}
              disabled={isLoading}
              className="btn-primary flex items-center gap-3 py-4 px-8 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 mx-auto bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span className="text-2xl">🎯</span>
              <span className="text-lg font-bold">
                {isLoading ? "격국 분석 중..." : "내 격국 확인하기"}
              </span>
              {!isLoading && (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 격국 결과 표시 */}
        {showResult && geokgukResult && (
          <div className="mt-8 pt-8 border-t-2 border-indigo-300 animate-fade-in-fast">
            {geokgukResult.판단가능 && geokgukResult.격국 ? (
              <div className="space-y-6">
                {/* 성공 케이스 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-300 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="inline-block px-4 py-2 bg-green-500 text-white rounded-full text-lg font-bold mb-3">
                      ✅ 격국 판단 완료
                    </div>
                    <h3 className="text-3xl font-extrabold text-gray-800 mb-2">
                      {geokgukResult.격국.격명칭}
                    </h3>
                    {/* 내격, 성격, 신뢰도 정보 숨김 */}
                    <div className="hidden">
                      <span>{geokgukResult.격국.격분류}</span>
                      <span>{geokgukResult.격국.성격상태}</span>
                      <span>{geokgukResult.격국.신뢰도}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* 격용신과 판단 근거를 나란히 배치 */}
                    <div className="bg-white/80 p-5 rounded-xl border border-green-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 격용신 박스 */}
                        <div>
                          <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2 text-lg">
                            <span>🎯</span> 격용신 (격을 이루는 천간)
                          </h4>
                          <div className="flex items-center gap-4">
                            {/* 월지와 지장간을 모두 표시 */}
                            {(() => {
                              const 월지 = geokgukResult.격국.월지;
                              const 격용신 = geokgukResult.격국.격용신;
                              const 월지Info = earthlyBranchGanInfo[월지];
                              const 월지Color = 월지Info
                                ? ohaengColorMap[월지Info.ohaeng]
                                : {
                                    bg: "bg-gray-400",
                                    text: "text-white",
                                    border: "",
                                  };

                              // 월지의 지장간 가져오기
                              const 지장간Data = allJijangganData[월지];
                              const 지장간List = 지장간Data
                                ? [
                                    지장간Data.여기,
                                    지장간Data.중기,
                                    지장간Data.본기,
                                  ].filter((item) => item !== undefined)
                                : [];

                              return (
                                <>
                                  {/* 월지 박스 (원국과 같은 크기) */}
                                  <div
                                    className={`saju-char-outline w-16 h-16 md:w-20 md:h-20 ${
                                      월지Color.bg
                                    } ${월지Color.text} ${
                                      월지Color.border || ""
                                    } rounded-lg flex items-center justify-center text-4xl md:text-5xl font-bold shadow-lg`}
                                  >
                                    {월지}
                                  </div>

                                  {/* 지장간 모두 표시 */}
                                  <div className="flex items-center gap-2">
                                    {지장간List.map((지장간, idx) => {
                                      const 지장간Info =
                                        earthlyBranchGanInfo[지장간.char];
                                      const 지장간Color = 지장간Info
                                        ? ohaengColorMap[지장간Info.ohaeng]
                                        : {
                                            bg: "bg-gray-400",
                                            text: "text-white",
                                            border: "",
                                          };
                                      const is격용신 = 지장간.char === 격용신;

                                      return (
                                        <div
                                          key={idx}
                                          className={`saju-char-outline ${
                                            is격용신
                                              ? "w-14 h-14 md:w-16 md:h-16 text-3xl md:text-4xl shadow-md"
                                              : "w-10 h-10 md:w-12 md:h-12 text-xl md:text-2xl shadow-sm opacity-70"
                                          } ${지장간Color.bg} ${
                                            지장간Color.text
                                          } ${
                                            지장간Color.border || ""
                                          } rounded-lg flex items-center justify-center font-bold`}
                                        >
                                          {지장간.char}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <div className="ml-2">
                                    <p className="text-gray-700 font-semibold text-base">
                                      격용신
                                    </p>
                                    <p className="text-gray-600 text-xs mt-1">
                                      {월지}월의 본기 {격용신}
                                    </p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* 판단 근거 박스 */}
                        {geokgukResult.격국.판단근거 && (
                          <div>
                            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2 text-lg">
                              <span>🔍</span> 판단 근거
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p className="text-gray-700">
                                <strong>방법:</strong>{" "}
                                {geokgukResult.격국.판단근거.방법}
                              </p>
                              {geokgukResult.격국.판단근거.투출천간 &&
                                geokgukResult.격국.판단근거.투출천간.length >
                                  0 && (
                                  <p className="text-gray-700">
                                    <strong>투출 천간:</strong>{" "}
                                    {geokgukResult.격국.판단근거.투출천간.join(
                                      ", "
                                    )}
                                  </p>
                                )}
                              {geokgukResult.격국.판단근거.일간체크 && (
                                <p className="text-gray-700">
                                  <strong>특이사항:</strong>{" "}
                                  {geokgukResult.격국.판단근거.일간체크}
                                </p>
                              )}
                              {geokgukResult.격국.판단근거.합국여부 && (
                                <p className="text-gray-700">
                                  <strong>합국:</strong>{" "}
                                  {geokgukResult.격국.판단근거.합국여부}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/80 p-5 rounded-xl border border-green-200">
                      <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2 text-lg">
                        <span>📝</span> 해석
                      </h4>
                      <p className="text-gray-700 leading-relaxed text-base">
                        {geokgukResult.격국.해석}
                      </p>
                    </div>

                    {/* 격국 상세 설명 */}
                    {geokgukDescriptions[geokgukResult.격국.격명칭] && (
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border-2 border-indigo-200">
                        <h4 className="font-bold text-indigo-800 mb-4 flex items-center gap-2 text-xl">
                          <span>📚</span>{" "}
                          {geokgukDescriptions[geokgukResult.격국.격명칭].title}
                        </h4>

                        <div className="mb-4">
                          <p className="text-gray-700 leading-relaxed text-base mb-3">
                            {
                              geokgukDescriptions[geokgukResult.격국.격명칭]
                                .description
                            }
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-white/70 p-4 rounded-lg border border-indigo-100">
                            <h5 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                              <span>✅</span> 장점
                            </h5>
                            <ul className="space-y-1">
                              {geokgukDescriptions[
                                geokgukResult.격국.격명칭
                              ].characteristics.pros.map((item, idx) => (
                                <li key={idx} className="text-gray-700 text-sm">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-white/70 p-4 rounded-lg border border-indigo-100">
                            <h5 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                              <span>⚠️</span> 주의점
                            </h5>
                            <ul className="space-y-1">
                              {geokgukDescriptions[
                                geokgukResult.격국.격명칭
                              ].characteristics.cons.map((item, idx) => (
                                <li key={idx} className="text-gray-700 text-sm">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="bg-white/70 p-4 rounded-lg border border-indigo-100 mb-4">
                          <h5 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                            <span>💼</span> 적합한 직업/분야
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {geokgukDescriptions[
                              geokgukResult.격국.격명칭
                            ].suitableJobs.map((job, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold"
                              >
                                {job}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <h5 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                            <span>💡</span> 조언
                          </h5>
                          <p className="text-gray-800 text-sm leading-relaxed">
                            {
                              geokgukDescriptions[geokgukResult.격국.격명칭]
                                .advice
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* 실패/예외 케이스 */
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border-2 border-yellow-300 shadow-lg">
                <div className="text-center mb-4">
                  <div className="inline-block px-4 py-2 bg-yellow-500 text-white rounded-full text-lg font-bold mb-3">
                    ⚠️ 격국 판단 어려움
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-800 mb-2">
                    {geokgukResult.메시지 || "격국을 판단하기 어렵습니다"}
                  </h3>
                </div>

                {geokgukResult.이유 && geokgukResult.이유.length > 0 && (
                  <div className="bg-white/80 p-5 rounded-xl border border-yellow-200">
                    <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                      <span>📋</span> 이유
                    </h4>
                    <ul className="space-y-2">
                      {geokgukResult.이유.map((reason, idx) => (
                        <li
                          key={idx}
                          className="text-gray-700 text-sm flex items-start gap-2"
                        >
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong>💡 참고:</strong> 투출이 없는 경우 대운에서 투출되면
                    격국이 드러날 수 있습니다. 현재는 격국을 명확히 판단하기
                    어렵지만, 대운의 흐름을 통해 향후 격국이 형성될 가능성이
                    있습니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
