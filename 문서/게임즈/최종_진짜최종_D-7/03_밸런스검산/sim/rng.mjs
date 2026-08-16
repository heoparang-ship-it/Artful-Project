/**
 * rng.mjs — 결정적 PRNG (5스트림 분리)
 *
 * 근거: GDD v4.0 18.5 결정적 랜덤 / 18.7 세이브 `rng` 카운트 / 발주서 6.4
 * 규칙:
 *  - 스트림 5종을 분리한다: scramble(아이템 배치) / production(업무 성공·사고)
 *    / reality(현실 이벤트) / backstudio(괴이) / vfx(연출, 결과 무영향).
 *  - 동일 시드 + 동일 선택 = 동일 런.
 *  - 연출·UI는 vfx만 소비한다. 결과 판정이 vfx를 소비하거나 그 역이면 위반이다(발주서 6.4-2).
 *  - 카운터 기반 PRNG를 쓴다. 상태 = (시드, 호출 카운트)이므로 세이브의 카운트만으로
 *    O(1) 복원이 가능하다(GDD 18.7 "시드와 카운트만 있으면 결정적 랜덤을 그대로 복원").
 *
 * @module rng
 */

/** 스트림 5종 정본 순서. (GDD 18.5) @type {ReadonlyArray<string>} */
export const STREAMS = Object.freeze(['scramble', 'production', 'reality', 'backstudio', 'vfx']);

/** 결과에 영향을 주지 않는 연출 전용 스트림. (발주서 6.4-2) */
export const PRESENTATION_STREAM = 'vfx';

/**
 * splitmix32 믹서. 32비트 정수 → 32비트 정수.
 * @param {number} x
 * @returns {number} 부호 없는 32비트 정수
 */
function mix32(x) {
  let z = (x + 0x9e3779b9) | 0;
  z = Math.imul(z ^ (z >>> 16), 0x21f0aaad);
  z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
  return (z ^ (z >>> 15)) >>> 0;
}

/**
 * 시드 + 스트림명 → 스트림 고유 시드. 스트림 간 상관을 끊는다. (GDD 18.5)
 * @param {number} seed
 * @param {string} name
 * @returns {number}
 */
export function deriveStreamSeed(seed, name) {
  let h = mix32(seed | 0);
  for (let i = 0; i < name.length; i += 1) h = mix32((h ^ name.charCodeAt(i)) | 0);
  return h >>> 0;
}

/**
 * 카운터 기반 난수. (streamSeed, counter) → [0, 1)
 * 순차 호출 없이 임의 카운트로 점프할 수 있어 세이브 복원이 O(1)이다. (GDD 18.7)
 * @param {number} streamSeed
 * @param {number} counter
 * @returns {number}
 */
export function valueAt(streamSeed, counter) {
  const a = mix32((streamSeed ^ mix32(counter | 0)) | 0);
  const b = mix32((a ^ 0x9e3779b9) | 0);
  // 53비트 정밀도로 합성해 하위 비트 편향을 없앤다.
  return ((a >>> 5) * 67108864 + (b >>> 6)) / 9007199254740992;
}

/**
 * 단일 스트림 핸들.
 * @typedef {object} Stream
 * @property {string} name 스트림명
 * @property {() => number} next [0,1) 난수 1개 소비
 * @property {(n: number) => number} int [0,n) 정수
 * @property {(pct: number) => boolean} chance 백분율 판정(pct% 확률로 true)
 * @property {<T>(arr: T[]) => T} pick 균등 추출
 * @property {<T extends {weight: number}>(arr: T[]) => T} weightedPick 가중 추출 (GDD 18.8 4단계)
 * @property {() => number} count 현재 호출 카운트
 * @property {(n: number) => void} setCount 카운트 강제 설정(세이브 복원용)
 */

/**
 * 결정적 RNG 생성. (GDD 18.5 / 18.7)
 * @param {number} seed 런 시드(= 시드런 프로젝트 코드, GDD 13.4)
 * @param {Object<string, number>} [counts] 스트림별 호출 카운트(세이브 복원 시)
 * @returns {{seed: number, stream: (name: string) => Stream, counts: () => Object<string, number>, restore: (c: Object<string, number>) => void, clone: () => object}}
 */
export function createRng(seed, counts = null) {
  const seeds = {};
  const state = {};
  for (const s of STREAMS) {
    seeds[s] = deriveStreamSeed(seed, s);
    state[s] = counts && Number.isFinite(counts[s]) ? counts[s] : 0;
  }

  const handles = {};
  for (const name of STREAMS) {
    const h = {
      name,
      next() {
        const v = valueAt(seeds[name], state[name]);
        state[name] += 1;
        return v;
      },
      int(n) {
        return Math.floor(h.next() * n);
      },
      chance(pct) {
        return h.next() * 100 < pct;
      },
      pick(arr) {
        return arr[h.int(arr.length)];
      },
      weightedPick(arr) {
        let total = 0;
        for (const e of arr) total += e.weight;
        let r = h.next() * total;
        for (const e of arr) {
          r -= e.weight;
          if (r < 0) return e;
        }
        return arr[arr.length - 1];
      },
      count() {
        return state[name];
      },
      setCount(n) {
        state[name] = n;
      },
    };
    handles[name] = h;
  }

  return {
    seed,
    /**
     * @param {string} name STREAMS 중 하나
     * @returns {Stream}
     */
    stream(name) {
      const h = handles[name];
      if (!h) throw new Error(`unknown rng stream: ${name} (allowed: ${STREAMS.join(', ')})`);
      return h;
    },
    /** 세이브에 기록할 스트림별 호출 카운트. (GDD 18.7) */
    counts() {
      return { ...state };
    },
    /** 세이브에서 읽은 카운트로 상태를 복원한다. (GDD 18.7) */
    restore(c) {
      for (const s of STREAMS) if (Number.isFinite(c?.[s])) state[s] = c[s];
    },
    /** 같은 시드·같은 카운트의 독립 인스턴스. 분기 리플레이 검증용. */
    clone() {
      return createRng(seed, { ...state });
    },
  };
}

/**
 * 시드 문자열(프로젝트 코드)을 32비트 정수 시드로 변환한다. (GDD 13.4 시드런 공유)
 * @param {string|number} code
 * @returns {number}
 */
export function seedFromCode(code) {
  if (typeof code === 'number') return code | 0;
  let h = 0x811c9dc5;
  for (let i = 0; i < code.length; i += 1) h = Math.imul(h ^ code.charCodeAt(i), 0x01000193) >>> 0;
  return h | 0;
}
