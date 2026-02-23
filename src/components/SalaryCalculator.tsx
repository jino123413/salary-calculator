import React, { useState } from 'react';
import { calculateSalary, reverseCalculate, formatMoney, getTimeBreakdown, type SalaryResult } from '../utils/taxCalculator';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import BannerAd from './BannerAd';

const INTERSTITIAL_AD_ID = 'ait.v2.live.930a5440e2a5464b';
const BANNER_AD_ID = 'ait.v2.live.b6619cdf85fd4640';

type Mode = 'normal' | 'reverse';

export default function SalaryCalculator() {
  const [mode, setMode] = useState<Mode>('normal');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<SalaryResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const { showAd } = useInterstitialAd(INTERSTITIAL_AD_ID);

  const performCalculation = () => {
    const amount = parseInt(inputValue.replace(/,/g, ''), 10);
    if (isNaN(amount) || amount <= 0) return;

    setIsCalculating(true);

    if (mode === 'normal') {
      const salary = amount * 10000;
      setResult(calculateSalary(salary));
    } else {
      const desired = amount * 10000;
      setResult(reverseCalculate(desired));
    }

    setIsCalculating(false);
  };

  const handleCalculate = () => {
    performCalculation();
  };

  const handleReset = () => {
    showAd({
      onDismiss: () => resetCalculation(),
    });
  };

  const resetCalculation = () => {
    setResult(null);
    setInputValue('');
  };

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setResult(null);
    setInputValue('');
  };

  const timeBreakdown = result ? getTimeBreakdown(result.annualSalary) : null;

  return (
    <div className="overflow-y-auto min-h-screen bg-[#F5F5F5]">
      <div className="p-4 pb-10">
        {/* 헤더 */}
        <div className="bg-primary rounded-xl p-5 mb-3 flex flex-col items-center">
          <h2 className="text-white text-xl font-bold">페이체크</h2>
          <p className="text-white/80 text-xs mt-1">연봉 실수령액 계산기</p>
        </div>

        {/* 모드 선택 탭 */}
        <div className="flex bg-white rounded-xl p-1 mb-3 shadow-sm">
          <button
            className={`flex-1 py-3 rounded-[10px] text-sm text-center transition-colors ${
              mode === 'normal' ? 'bg-primary text-white font-bold' : 'text-[#6B7684]'
            }`}
            onClick={() => handleModeSwitch('normal')}
          >
            연봉 &gt; 실수령
          </button>
          <button
            className={`flex-1 py-3 rounded-[10px] text-sm text-center transition-colors ${
              mode === 'reverse' ? 'bg-primary text-white font-bold' : 'text-[#6B7684]'
            }`}
            onClick={() => handleModeSwitch('reverse')}
          >
            실수령 &gt; 연봉 역산
          </button>
        </div>

        {/* 입력 카드 */}
        <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
          <p className="text-sm font-bold mb-2">
            {mode === 'normal' ? '연봉 (만원)' : '희망 월 실수령액 (만원)'}
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder={mode === 'normal' ? '예: 4000' : '예: 300'}
          />
          <p className="text-[#999] text-xs mt-2">
            {mode === 'normal'
              ? '세전 연봉을 만원 단위로 입력하세요 (예: 4000 = 4,000만원)'
              : '매달 받고 싶은 실수령액을 만원 단위로 입력하세요'}
          </p>
        </div>

        {/* 계산 버튼 */}
        <div className="mb-3">
          <button
            className="w-full py-4 rounded-xl bg-primary text-white font-bold text-base disabled:opacity-50"
            onClick={handleCalculate}
            disabled={!inputValue || isCalculating}
          >
            {isCalculating ? '계산 중...' : '계산하기'}
          </button>
        </div>

        {/* 결과 */}
        {result && (
          <>
            {/* 역산 모드일 때 필요 연봉 강조 */}
            {mode === 'reverse' && (
              <div className="bg-primary rounded-xl p-5 mb-3 flex flex-col items-center">
                <p className="text-white/80 text-xs">필요 연봉</p>
                <p className="text-white text-2xl font-bold my-1">
                  {formatMoney(result.annualSalary / 10000)}만원
                </p>
                <p className="text-white/70 text-xs">
                  월 {formatMoney(result.netMonthly)}원을 받으려면 이 연봉이 필요합니다
                </p>
              </div>
            )}

            {/* 핵심 요약 */}
            <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <div className="flex items-center">
                <div className="flex-1 text-center">
                  <p className="text-[#6B7684] text-xs mb-1">세전 월급</p>
                  <p className="text-base font-bold">{formatMoney(result.monthlySalary)}원</p>
                </div>
                <div className="w-px h-10 bg-[#F0F0F0]" />
                <div className="flex-1 text-center">
                  <p className="text-[#6B7684] text-xs mb-1">월 실수령액</p>
                  <p className="text-base font-bold text-primary">{formatMoney(result.netMonthly)}원</p>
                </div>
              </div>
              <div className="h-2 bg-[#F0F0F0] rounded mt-4 overflow-hidden">
                <div
                  className="h-full bg-primary rounded"
                  style={{ width: `${100 - result.deductionRate}%` }}
                />
              </div>
              <p className="text-[#999] text-xs text-center mt-2">
                공제율 {result.deductionRate}% | 연 실수령 {formatMoney(result.netAnnual)}원
              </p>
            </div>

            {/* 배너 광고 */}
            <div className="mb-3">
              <BannerAd adGroupId={BANNER_AD_ID} />
            </div>

            {/* 공제 상세 */}
            <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <p className="text-sm font-bold mb-3">공제 내역 (월)</p>

              <div className="mb-3">
                <p className="text-xs font-bold text-primary mb-2">4대보험</p>
                <DeductionRow label="국민연금" amount={result.nationalPension} rate={4.5} />
                <DeductionRow label="건강보험" amount={result.healthInsurance} rate={3.545} />
                <DeductionRow label="장기요양보험" amount={result.longTermCare} />
                <DeductionRow label="고용보험" amount={result.employmentInsurance} rate={0.9} />
              </div>

              <div className="mb-3">
                <p className="text-xs font-bold text-primary mb-2">세금</p>
                <DeductionRow label="소득세" amount={result.incomeTax} />
                <DeductionRow label="지방소득세" amount={result.localIncomeTax} />
              </div>

              <div className="flex justify-between pt-3 border-t border-[#F0F0F0]">
                <p className="text-sm font-bold">공제 합계</p>
                <p className="text-sm font-bold text-[#F04452]">
                  -{formatMoney(result.totalDeductions)}원
                </p>
              </div>
            </div>

            {/* 시간당 환산 */}
            {timeBreakdown && (
              <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                <p className="text-sm font-bold mb-3">실수령 기준 시간 환산</p>
                <div className="flex gap-2">
                  <TimeBox label="일급" amount={timeBreakdown.daily} />
                  <TimeBox label="시급" amount={timeBreakdown.hourly} />
                  <TimeBox label="분급" amount={timeBreakdown.perMinute} />
                </div>
              </div>
            )}

            {/* 새로 계산하기 버튼 */}
            <div className="flex flex-col items-center mb-3">
              <button
                className="bg-[#F4F4F4] py-3 px-6 rounded-lg"
                onClick={handleReset}
              >
                <span className="text-sm font-bold text-[#6B7684]">새로 계산하기</span>
              </button>
              <p className="text-[#999] text-xs mt-2 text-center">
                광고 시청 후 새로운 계산을 시작합니다
              </p>
            </div>
          </>
        )}

        {/* 안내 */}
        <div className="px-1 mt-1">
          <p className="text-[#BBB] text-xs text-center leading-[18px]">
            2025년 4대보험 요율 기준이며, 부양가족 수에 따라 실제 금액과 차이가 있을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function DeductionRow({ label, amount, rate }: { label: string; amount: number; rate?: number }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-[#333]">{label}</span>
        {rate !== undefined && (
          <span className="text-[11px] text-[#999]">{rate}%</span>
        )}
      </div>
      <span className="text-xs text-[#F04452]">-{formatMoney(amount)}원</span>
    </div>
  );
}

function TimeBox({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex-1 bg-[#F8F9FA] rounded-lg p-3 text-center">
      <p className="text-xs text-[#6B7684] mb-1">{label}</p>
      <p className="text-sm font-bold">{formatMoney(amount)}원</p>
    </div>
  );
}
