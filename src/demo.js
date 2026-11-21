/* 예시 데이터 (의료기기 설치팀): 한 달 일정 + 트러블슈팅 50건 + 매입·매출 (demo:true 로 표시해 한 번에 지울 수 있음) */

export const SITES = [
  ['수원 한빛종합병원 영상의학과', '수원시 팔달구 중부대로 93'],
  ['광교 밝은눈안과', '수원시 영통구 광교중앙로 145'],
  ['영통 튼튼정형외과', '수원시 영통구 봉영로 1612'],
  ['인계 새봄산부인과', '수원시 팔달구 인계로 166'],
  ['동탄 미소치과', '화성시 동탄대로 446'],
  ['매탄 하나내과의원', '수원시 영통구 매탄로 85'],
  ['권선 사랑요양병원', '수원시 권선구 권선로 640'],
  ['기흥 바른재활의학과', '용인시 기흥구 기흥로 58'],
  ['정자 우리아이소아과', '수원시 장안구 정자천로 120'],
  ['병점 연합영상의학과', '화성시 병점중앙로 200'],
  ['오산 중앙병원 수술실', '오산시 경기대로 300'],
  ['광교 건강검진센터', '수원시 영통구 광교호수로 50'],
];

/* 장비 종류(폴더)별 고장 묶음: 같은 증상 첫마디·에러코드를 공유해서 폴더 안에서 한데 모이고 "비슷한 고장"으로도 찾아짐 */
const CL = [
  { cat: '영상 (X-ray · DR)', job: ['DR 디텍터 설치', 'X-ray 정기점검'], amt: [400000, 2500000], issues: [
    { equip: ['DR 디텍터 무선 1417W', 'DR 디텍터 무선 1417W', 'DR 디텍터 무선 1012W'], sym: ['디텍터 연결 끊김 E-201', '디텍터 연결 끊김 E-201, 촬영 대기 중 발생', '디텍터 연결 끊김 E-201, 오후에 잦음'],
      fix: [['병원 Wi-Fi와 AP 채널 간섭', '디텍터 전용 AP 채널 고정, AP 위치 이동'], ['디텍터 배터리 노후로 전압 저하', '배터리 교체 후 연결 테스트'], ['촬영 PC 방화벽이 통신 포트 차단', '방화벽 예외 등록']] },
    { equip: ['X-ray 발생장치 고주파 50kW', 'X-ray 발생장치 고주파 32kW'], sym: ['촬영 중 kV 에러로 노출 중단', '촬영 중 kV 에러, 고관전압에서만 발생'],
      fix: [['고압 케이블 커넥터 오염', '커넥터 청소 후 절연 그리스 재도포'], ['튜브 워밍업 미실시', '아침 워밍업 절차 안내, 시운전']] } ] },
  { cat: '초음파', job: ['초음파 진단기 설치·교육'], amt: [300000, 1500000], issues: [
    { equip: ['초음파 진단기 카트형', '초음파 볼록형 프로브 C5', '초음파 선형 프로브 L12'], sym: ['영상에 세로 줄무늬', '영상에 세로 줄무늬, 특정 깊이에서 심함', '영상에 세로 줄무늬 2줄'],
      fix: [['프로브 소자 일부 손상', '프로브 제조사 수리 의뢰, 대체 프로브 대여'], ['프로브 커넥터 핀 휨', '핀 교정 후 화질 확인']] },
    { equip: ['초음파 진단기 이동형', '초음파 진단기 카트형'], sym: ['프로브 인식 안 됨', '프로브 인식 안 됨, 포트 바꾸면 됨'],
      fix: [['프로브 포트 접점 산화', '접점 청소'], ['시스템 소프트웨어 오류', '소프트웨어 재설치 후 프리셋 복원']] } ] },
  { cat: '환자감시 · 호흡', job: ['환자감시장치 설치', '인공호흡기 점검'], amt: [200000, 1200000], issues: [
    { equip: ['환자감시장치 12인치', '환자감시장치 15인치'], sym: ['SpO2 측정값 안 나옴', 'SpO2 측정값 안 나옴, 센서 바꾸면 잠깐 됨'],
      fix: [['SpO2 센서 케이블 단선', '센서 교체'], ['센서 착용 위치 불량', '간호사 대상 착용법 교육']] },
    { equip: ['중앙감시 스테이션', '환자감시장치 12인치'], sym: ['중앙감시 연결 끊김', '중앙감시 연결 끊김, 병동 2곳만'],
      fix: [['병동 스위치 IP 충돌', '장비 고정 IP 재설정'], ['랜 케이블 커넥터 불량', '커넥터 재작업']] },
    { equip: ['인공호흡기 ICU형', '인공호흡기 이동형'], sym: ['유량 센서 에러', '유량 센서 에러, 자가 테스트 실패'],
      fix: [['유량 센서 오염', '유량 센서 교체 후 캘리브레이션'], ['호흡회로 연결부 누설', '회로 교체, 누설 테스트 통과']] } ] },
  { cat: '멸균 · 소독', job: ['멸균기 정기점검', '내시경 세척기 설치'], amt: [150000, 900000], issues: [
    { equip: ['고압증기멸균기 60L', '고압증기멸균기 120L'], sym: ['압력 미달로 사이클 중단', '압력 미달로 사이클 중단, 건조 단계에서'],
      fix: [['도어 가스켓 경화로 증기 누설', '가스켓 교체, 볼트 재조임'], ['스팀 트랩 막힘', '스팀 트랩 분해 청소']] },
    { equip: ['고압증기멸균기 60L', '내시경 세척소독기'], sym: ['문 잠김 에러로 시작 안 됨', '문 잠김 에러로 시작 안 됨, 간헐적'],
      fix: [['도어 잠금 스위치 접점 불량', '잠금 스위치 교체'], ['도어 걸쇠 위치 틀어짐', '걸쇠 위치 조정']] } ] },
  { cat: '치과 장비', job: ['치과 유니트체어 설치', '치과 장비 점검'], amt: [200000, 1800000], issues: [
    { equip: ['치과 유니트체어', '치과 석션 모터'], sym: ['석션 흡입력 약함', '석션 흡입력 약함, 오후에 더 심함'],
      fix: [['석션 필터 막힘', '필터 청소·교체, 사용 후 세척 안내'], ['석션 모터 과열', '모터 냉각팬 청소, 환기 확보']] },
    { equip: ['치과 유니트체어', '치과 컴프레서'], sym: ['체어 등받이 안 움직임', '컴프레서 과열 정지'],
      fix: [['유압 펌프 릴레이 불량', '릴레이 교체'], ['컴프레서 흡기 필터 막힘', '흡기 필터 교체, 드레인 배출']] } ] },
  { cat: '수술실 장비', job: ['수술등 설치', '수술실 장비 점검'], amt: [300000, 2000000], issues: [
    { equip: ['수술등 LED 듀얼', '수술등 LED 싱글'], sym: ['수술등 일부 LED 꺼짐', '수술등 일부 LED 꺼짐, 밝기 낮추면 깜빡임'],
      fix: [['LED 드라이버 불량', 'LED 드라이버 교체'], ['헤드 내부 커넥터 접촉 불량', '커넥터 재체결']] },
    { equip: ['전동 수술대', '전기수술기'], sym: ['수술대 높이 조절 안 됨', '전기수술기 패드 경고음'],
      fix: [['핸드 리모컨 케이블 단선', '리모컨 케이블 교체'], ['환자 접지패드 접촉 불량', '패드 부착 위치 교육']] } ] },
  { cat: '검사 장비', job: ['혈액분석기 설치', '검사 장비 점검'], amt: [200000, 1200000], issues: [
    { equip: ['혈액분석기 5Diff', '혈액분석기 3Diff'], sym: ['검체 흡인 에러', '검체 흡인 에러, 아침 첫 검사에서'],
      fix: [['흡인 노즐 막힘', '노즐 세척, 세정액 보충'], ['시약 튜브 꺾임', '튜브 재배선']] },
    { equip: ['생화학분석기', '혈액분석기 5Diff'], sym: ['QC 결과 범위 벗어남', 'QC 결과 범위 벗어남, 특정 항목만'],
      fix: [['시약 개봉 후 보관 기간 초과', '시약 교체 후 QC 재실시'], ['광원 램프 수명', '램프 교체 후 캘리브레이션']] } ] },
  { cat: '물리치료', job: ['체외충격파 장비 설치', '물리치료기 점검'], amt: [150000, 1500000], issues: [
    { equip: ['체외충격파 치료기', '간섭전류 치료기'], sym: ['출력 안 나옴', '출력 안 나옴, 화면은 정상'],
      fix: [['핸드피스 케이블 단선', '케이블 교체'], ['출력 보드 퓨즈 단선', '퓨즈 교체 후 출력 측정']] } ] },
];

const BUYS = [['디텍터 배터리', '메디파츠', 280000], ['SpO2 센서 3개', '메디파츠', 135000], ['도어 가스켓', '멸균기부품', 92000], ['석션 필터 세트', '덴탈부품몰', 38000], ['LED 드라이버', '메디파츠', 165000], ['유량 센서', '메디파츠', 210000], ['랜 케이블·커넥터', '수원전자상가', 27000], ['프로브 커넥터 핀', '메디파츠', 46000], ['절연 그리스·청소용품', '수원전자상가', 18000], ['출장 주차비', '병원 주차장', 6000]];
const MEMBERS = [{ id: 'me', name: '황도경', role: 'owner', color: '#1D4ED8' }, { id: 'm_kim', name: '김민수', role: 'tech', color: '#C2410C' }, { id: 'm_lee', name: '이준호', role: 'tech', color: '#7C3AED' }, { id: 'm_park', name: '박성진', role: 'tech', color: '#0F766E' }];

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const p2 = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
const split = total => { const supply = Math.round(total / 1.1); return { total, supply, vat: total - supply }; };

export function buildDemo(team) {
  const R = rng(20261121); const pick = a => a[Math.floor(R() * a.length)];
  const ri = (a, b) => Math.round((a + R() * (b - a)) / 10000) * 10000;
  let k = 0; const id = p => 'demo_' + p + '_' + (k++).toString(36);
  const now = new Date(); const today = ymd(now); const Y = now.getFullYear(), M = now.getMonth();
  const newTeam = !team; const mem = team ? team.members : MEMBERS; const who = () => pick(mem).id;
  const notes = [], schedules = [], txs = [];

  /* 트러블슈팅 50건: 최근 90일에 흩어서 */
  const ISS = CL.flatMap(c => c.issues.map(x => Object.assign({ cat: c.cat }, x)));
  for (let i = 0; i < 50; i++) {
    const c = ISS[i % ISS.length], v = Math.floor(i / ISS.length);
    const [cause, action] = c.fix[(v + i) % c.fix.length]; const site = SITES[(i * 5) % SITES.length];
    const at = new Date(now.getTime() - (2 + Math.floor(R() * 88)) * 86400000); at.setHours(9 + Math.floor(R() * 8), Math.floor(R() * 60));
    notes.push({ id: id('n'), demo: true, cat: c.cat, createdAt: at.getTime(), updatedAt: at.getTime(), who: who(), equip: c.equip[v % c.equip.length], site: site[0], symptom: c.sym[(v * 2 + i) % c.sym.length], cause, action, memo: R() < 0.3 ? '재발 시 ' + pick(['압력', '전류', '절연', '온도']) + ' 값부터 확인' : '', resolved: R() < 0.88, photos: [] });
  }

  /* 이번 달 일정: 일요일 빼고 하루 1~3건 */
  const last = new Date(Y, M + 1, 0).getDate(); let waitLeft = 2;
  for (let d = 1; d <= last; d++) {
    const dt = new Date(Y, M, d); const ds = ymd(dt); if (dt.getDay() === 0 && ds !== today) continue;
    const n = ds === today ? 3 : dt.getDay() === 6 ? 1 + Math.floor(R() * 2) : 2 + Math.floor(R() * 2); let hour = 8 + Math.floor(R() * 2);
    for (let j = 0; j < n; j++) {
      const c = pick(CL); const job = pick(c.job); const site = pick(SITES); const dur = 1 + Math.floor(R() * 3); const amt = ri(c.amt[0], c.amt[1]);
      let status = ds < today ? '완료' : ds > today ? '예정' : j === 0 ? '완료' : j === 1 ? '진행 중' : '예정';
      if (status === '예정' && waitLeft && R() < 0.15) { status = '자재 대기'; waitLeft--; }
      const mm = R() < 0.5 ? '00' : '30'; const s = { id: id('s'), demo: true, title: job, client: site[0], addr: site[1], date: ds, start: p2(hour) + ':' + mm, end: p2(Math.min(hour + dur, 20)) + ':' + mm, status, amount: amt, autoSale: true, who: who(), noteId: null, saleTxId: null, createdAt: dt.getTime(), updatedAt: dt.getTime() };
      hour = Math.min(hour + dur + 1, 17);
      if (status === '완료') {
        const t = Object.assign({ id: id('t'), demo: true, createdAt: dt.getTime(), type: 'sale', vatIncl: true, date: ds, party: site[0], memo: job, proof: '', who: s.who, schedId: s.id, photos: [] }, split(amt));
        txs.push(t); s.saleTxId = t.id;
        const nt = notes.find(x => !x.linked && x.cat === c.cat); if (nt) { nt.linked = true; nt.site = site[0]; nt.createdAt = nt.updatedAt = dt.getTime() + 3600000 * (hour - 1); s.noteId = nt.id; }
      }
      if (ds <= today && (status !== '예정' || R() < 0.3)) { /* 일정에 붙은 매입 (자재) */
        const b = pick(BUYS); txs.push(Object.assign({ id: id('t'), demo: true, createdAt: dt.getTime(), type: 'buy', vatIncl: true, date: ds, party: b[1], memo: b[0] + ' · ' + site[0], proof: pick(['카드', '카드', '세금계산서', '현금영수증']), who: s.who, schedId: s.id, photos: [] }, split(b[2])));
      }
      schedules.push(s);
    }
    if (dt.getDay() === 1 && ds <= today) txs.push(Object.assign({ id: id('t'), demo: true, createdAt: dt.getTime(), type: 'buy', vatIncl: true, date: ds, party: 'SK주유소', memo: '작업차 주유', proof: '카드', who: 'me', schedId: null, photos: [] }, split(ri(70000, 110000))));
  }
  notes.forEach(n => delete n.linked);

  const t0 = Date.now(); const by = mem.find(m => m.id !== 'me') || mem[0]; const by2 = mem.find(m => m.id !== 'me' && m.id !== by.id) || by;
  const wait = schedules.find(s => s.status === '자재 대기');
  const messages = [
    { id: id('m'), demo: true, by: 'me', text: '내일 한빛종합병원 DR 설치는 외래 시작 전 8시까지 도착 부탁해요', at: t0 - 5 * 3600000 },
    { id: id('m'), demo: true, by: by.id, text: '네 알겠습니다. 전용 AP랑 캘리브레이션 팬텀 챙겨갈게요', at: t0 - 4.8 * 3600000 },
    { id: id('m'), demo: true, by: by2.id, text: '오산 중앙병원 수술등 LED 드라이버 교체 끝났습니다. 사진 트러블슈팅에 올렸어요', at: t0 - 2 * 3600000 },
  ];
  const requests = [
    { id: id('r'), demo: true, by: by.id, kind: '자재·부품', item: 'SpO2 센서', qty: '5개', schedId: wait ? wait.id : null, when: 'today', hold: !!wait, memo: '병동 교체분 재고가 없어요', photo: null, status: 'new', created: t0 - 3 * 3600000 },
    { id: id('r'), demo: true, by: by2.id, kind: '공구', item: '전기안전 측정기 리드선', qty: '1세트', schedId: null, when: 'week', hold: false, memo: '피복이 벗겨졌어요', photo: null, status: 'approved', created: t0 - 26 * 3600000 },
  ];
  return { notes, schedules, txs, messages, requests, team: newTeam ? { name: '도경메디칼', code: 'GISA-DEMO', demo: true, members: MEMBERS } : null };
}
