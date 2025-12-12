import React, { useMemo, useState } from "react";
import type { SajuInfo, Ohaeng } from "../types";
import {
  earthlyBranchGanInfo,
  getDayGanjiByYMD,
  getMonthGanjiByDateKST,
  getUnseongByIlganAndJiji,
} from "../utils/manse";
import { cheonEulGwiInMap } from "../utils/sinsal";

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"] as const;
const weekdayFullLabels = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
] as const;

const ohaengColorMap: Record<Ohaeng, { bg: string; text: string; border?: string }> =
  {
    wood: { bg: "bg-[#00B050]", text: "text-white", border: "border border-gray-800" },
    fire: { bg: "bg-[#FF0000]", text: "text-white", border: "border border-gray-800" },
    earth: { bg: "bg-[#FEC100]", text: "text-white", border: "border border-gray-800" },
    metal: { bg: "bg-slate-200", text: "text-white", border: "border border-gray-800" },
    water: { bg: "bg-black", text: "text-white", border: "border border-gray-800" },
  };

const buildDateKST = (year: number, month: number, day: number) => {
  const isoStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}T00:00:00+09:00`;
  return new Date(isoStr);
};

const MIN_YEAR = 1940;
const MIN_MONTH = 2; // 1940년 1월은 이전 사주연도(1939) 절기 데이터가 없어 월주 계산이 불가
const MAX_YEAR = 2050;
const MAX_MONTH = 12;

const clampYearMonth = (year: number, month: number) => {
  let y = year;
  let m = month;
  if (y < MIN_YEAR) {
    y = MIN_YEAR;
    m = MIN_MONTH;
  }
  if (y === MIN_YEAR && m < MIN_MONTH) m = MIN_MONTH;
  if (y > MAX_YEAR) {
    y = MAX_YEAR;
    m = MAX_MONTH;
  }
  if (y === MAX_YEAR && m > MAX_MONTH) m = MAX_MONTH;
  return { year: y, month: m };
};

const addMonths = (year: number, month: number, delta: number) => {
  const idx = year * 12 + (month - 1) + delta;
  const y = Math.floor(idx / 12);
  const m = (idx % 12) + 1;
  return { year: y, month: m };
};

const SmallCharBox: React.FC<{ char: string }> = ({ char }) => {
  const info = earthlyBranchGanInfo[char];
  if (!info) return null;
  const color = ohaengColorMap[info.ohaeng];

  return (
    <div
      className={`saju-char-outline-small w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-lg md:text-xl font-bold rounded-md shadow-sm ${color.bg} ${color.text} ${
        color.border ?? ""
      }`}
    >
      {char}
    </div>
  );
};

export const MonthlyIljuCalendar: React.FC<{ sajuInfo: SajuInfo }> = ({
  sajuInfo,
}) => {
  const ilgan = sajuInfo.pillars.day.cheonGan.char;
  const cheonEulJijis = useMemo(() => cheonEulGwiInMap[ilgan] || [], [ilgan]);

  const today = new Date();
  const initialYM = clampYearMonth(today.getFullYear(), today.getMonth() + 1);
  const [viewYear, setViewYear] = useState<number>(initialYM.year);
  const [viewMonth, setViewMonth] = useState<number>(initialYM.month); // 1-12
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth, 0).getDate();
  }, [viewYear, viewMonth]);

  const firstDow = useMemo(() => {
    return new Date(viewYear, viewMonth - 1, 1).getDay();
  }, [viewYear, viewMonth]);

  const selectedDate = useMemo(
    () => buildDateKST(viewYear, viewMonth, Math.min(selectedDay, daysInMonth)),
    [viewYear, viewMonth, selectedDay, daysInMonth]
  );

  const headerText = useMemo(() => {
    const d = selectedDate.getDate();
    const dow = selectedDate.getDay();
    return `${viewMonth}월 ${d}일 ${weekdayFullLabels[dow]}`;
  }, [selectedDate, viewMonth]);

  const selectedDayInfo = useMemo(() => {
    const d = Math.min(selectedDay, daysInMonth);
    const { gan, ji, ganji } = getDayGanjiByYMD(viewYear, viewMonth, d);
    const unseong = getUnseongByIlganAndJiji(ilgan, ji);
    return { d, gan, ji, ganji, unseong };
  }, [ilgan, viewYear, viewMonth, selectedDay, daysInMonth]);

  const selectedMonthInfo = useMemo(() => {
    try {
      return getMonthGanjiByDateKST(selectedDate);
    } catch {
      return null;
    }
  }, [selectedDate]);

  const canPrev = useMemo(() => {
    if (viewYear > MIN_YEAR) return true;
    return viewYear === MIN_YEAR && viewMonth > MIN_MONTH;
  }, [viewYear, viewMonth]);

  const canNext = useMemo(() => {
    if (viewYear < MAX_YEAR) return true;
    return viewYear === MAX_YEAR && viewMonth < MAX_MONTH;
  }, [viewYear, viewMonth]);

  const goPrevMonth = () => {
    if (!canPrev) return;
    const moved = addMonths(viewYear, viewMonth, -1);
    const nextYM = clampYearMonth(moved.year, moved.month);
    setViewYear(nextYM.year);
    setViewMonth(nextYM.month);
  };

  const goNextMonth = () => {
    if (!canNext) return;
    const moved = addMonths(viewYear, viewMonth, 1);
    const nextYM = clampYearMonth(moved.year, moved.month);
    setViewYear(nextYM.year);
    setViewMonth(nextYM.month);
  };

  const cells = useMemo(() => {
    const total = firstDow + daysInMonth;
    const padded = Math.ceil(total / 7) * 7;
    return Array.from({ length: padded }, (_, idx) => {
      const day = idx - firstDow + 1;
      if (day < 1 || day > daysInMonth) return null;
      const { gan, ji } = getDayGanjiByYMD(viewYear, viewMonth, day);
      const unseong = getUnseongByIlganAndJiji(ilgan, ji);
      const isCheonEul = cheonEulJijis.includes(ji);
      return { day, gan, ji, unseong, isCheonEul };
    });
  }, [firstDow, daysInMonth, viewYear, viewMonth, ilgan, cheonEulJijis]);

  return (
    <div className="mt-8 p-4 md:p-6 glass-card animate-fade-in">
      {/* 헤더(선택 날짜 + 일주) */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-lg md:text-xl font-bold text-gray-800">
          {headerText}
        </div>
        <div className="flex items-center gap-2">
          <SmallCharBox char={selectedDayInfo.gan} />
          <SmallCharBox char={selectedDayInfo.ji} />
        </div>
      </div>

      {/* 캘린더 바깥 정보 박스(월/월주) */}
      <div className="mb-4 flex items-stretch gap-3">
        <div className="glass-card p-3 md:p-4 flex flex-col justify-center min-w-[140px]">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrevMonth}
              disabled={!canPrev}
              className={`px-2 py-1 rounded-md border text-sm font-bold ${
                canPrev
                  ? "border-gray-300 bg-white/60 hover:bg-white text-gray-700"
                  : "border-gray-200 bg-gray-100/60 text-gray-400 cursor-not-allowed"
              }`}
              aria-label="이전 달"
            >
              ‹
            </button>
            <div className="text-gray-700 font-bold text-base md:text-lg">
              {viewYear}년 {viewMonth}월
            </div>
            <button
              type="button"
              onClick={goNextMonth}
              disabled={!canNext}
              className={`px-2 py-1 rounded-md border text-sm font-bold ${
                canNext
                  ? "border-gray-300 bg-white/60 hover:bg-white text-gray-700"
                  : "border-gray-200 bg-gray-100/60 text-gray-400 cursor-not-allowed"
              }`}
              aria-label="다음 달"
            >
              ›
            </button>
          </div>
          <div className="mt-2 text-gray-600 text-sm md:text-base">
            월주:{" "}
            <span className="font-semibold text-gray-800">
              {selectedMonthInfo?.monthGanji ?? "-"}
            </span>
            {selectedMonthInfo?.monthName ? (
              <span className="ml-2 text-gray-500">({selectedMonthInfo.monthName})</span>
            ) : null}
          </div>
        </div>
        <div className="flex-1" />
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {weekdayLabels.map((w) => (
          <div
            key={w}
            className="text-center text-xs md:text-sm font-bold text-gray-600"
          >
            {w}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, idx) => {
          if (!cell) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-[64px] md:h-[76px] rounded-lg bg-gray-100/30"
              />
            );
          }

          const isSelected = cell.day === selectedDayInfo.d;

          return (
            <button
              key={`${viewYear}-${viewMonth}-${cell.day}`}
              type="button"
              onClick={() => setSelectedDay(cell.day)}
              className={`h-[64px] md:h-[76px] rounded-lg border bg-white/60 hover:bg-white transition-colors overflow-hidden ${
                isSelected ? "ring-2 ring-blue-400" : ""
              } ${
                cell.isCheonEul ? "border-gray-900 border-2" : "border-gray-200"
              }`}
            >
              <div className="h-full grid grid-cols-[40px_1fr] grid-rows-2">
                {/* 좌측: 일주 */}
                <div className="row-span-2 flex flex-col items-center justify-center gap-1 bg-white/30">
                  <SmallCharBox char={cell.gan} />
                  <SmallCharBox char={cell.ji} />
                </div>

                {/* 우측 상단: 날짜 */}
                <div className="flex items-start justify-end pr-1 pt-1 text-xs font-bold text-gray-700">
                  {cell.day}
                </div>

                {/* 우측 하단: 십이운성 */}
                <div className="flex items-end justify-end pr-1 pb-1 text-[10px] md:text-xs font-semibold text-gray-600">
                  {cell.unseong.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};


