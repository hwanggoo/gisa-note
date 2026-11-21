/* 예시 데이터: 한 달 일정 + 트러블슈팅 50건 + 매입·매출 (demo:true 로 표시해 한 번에 지울 수 있음) */

export const SITES = [
  ['영통 한빛치과', '수원시 영통구 봉영로 1612'],
  ['광교 그린마트', '수원시 영통구 광교중앙로 145'],
  ['인계동 블루카페', '수원시 팔달구 인계로 166'],
  ['망포 행복아파트 관리실', '수원시 영통구 망포로 30'],
  ['동탄 미래물류센터', '화성시 동탄산단로 22'],
  ['매탄 한우명가', '수원시 영통구 매탄로 85'],
  ['권선 새봄어린이집', '수원시 권선구 권선로 640'],
  ['기흥 대성정밀', '용인시 기흥구 기흥로 58'],
  ['정자동 스마트빌딩', '수원시 장안구 정자천로 120'],
  ['병점 가온헬스장', '화성시 병점중앙로 200'],
  ['오산 한솔식품 공장', '오산시 경기대로 300'],
  ['광교 센트럴상가 2층', '수원시 영통구 광교호수로 50'],
];

/* 고장 유형별 묶음: 같은 장비·증상 단어를 공유해서 "비슷한 고장"으로 서로 찾아지게 함 */
const CL = [
  { job: '시스템에어컨 통신 에러 수리', amt: [180000, 350000],
    equip: ['삼성 시스템에어컨 실외기 AM100', '삼성 시스템에어컨 실외기 AM120', '삼성 시스템에어컨 실내기 AM100 4WAY'],
    sym: ['E101 통신 에러, 실내기 전체 정지', '실외기 E101 통신 에러 반복, 껐다 켜면 잠깐 됨', 'E101 에러 후 일부 실내기만 작동 안 됨'],
    fix: [['통신선 단자 산화로 접촉 불량', '단자 청소 후 재압착, 접점부활제 도포'], ['통신선 중간 접속부 테이핑 불량, 빗물 유입', '접속부 재시공 후 방수 처리'], ['실내기 주소 설정 중복', '주소 재설정 후 시운전']] },
  { job: 'LG 실외기 에러 점검', amt: [150000, 300000],
    equip: ['LG 멀티V 실외기 ARUN', 'LG 멀티V 실외기 ARUM', 'LG 휘센 시스템에어컨 실외기'],
    sym: ['CH05 통신 에러', 'CH05 에러, 실내기 리모컨 먹통', '실외기 CH21 에러 후 정지'],
    fix: [['실외기 PCB 통신 커넥터 헐거움', '커넥터 재체결, 케이블 타이 고정'], ['리모컨선 단선', '리모컨선 교체'], ['인버터 PCB IPM 손상', 'PCB 교체 (자재 대기 3일)']] },
  { job: '냉동창고 압축기 점검', amt: [300000, 900000],
    equip: ['냉동창고 압축기 반밀폐 5마력', '냉동창고 압축기 스크롤 7.5마력', '냉동창고 콘덴싱유닛 5마력'],
    sym: ['고압 트립, 창고 온도 -5도까지 상승', '압축기 고압 트립 반복, 오후에만 발생', '압축기 과열로 OCR 트립'],
    fix: [['응축기 핀 먼지 막힘으로 응축 불량', '응축기 고압 세척, 팬 모터 점검'], ['응축기 팬 모터 베어링 고착', '팬 모터 교체'], ['냉매 과충전', '냉매 회수 후 적정량 재충전, 고압 확인']] },
  { job: '쇼케이스 냉장 불량 수리', amt: [200000, 600000],
    equip: ['오픈 쇼케이스 냉장 1800', '음료 쇼케이스 냉장 2도어', '정육 쇼케이스 냉장'],
    sym: ['냉장 안 됨, 온도 12도 유지', '쇼케이스 냉장 약함, 서리 많이 낌', '냉장 안 됨, 압축기는 돌아감'],
    fix: [['배관 용접부 냉매 누설', '누설부 재용접, 질소 가압 테스트 후 냉매 충전'], ['제상 히터 단선으로 증발기 결빙', '제상 히터 교체, 제상 주기 재설정'], ['팽창밸브 막힘', '팽창밸브 교체 후 진공 및 냉매 충전']] },
  { job: '가스보일러 점화불량 수리', amt: [80000, 250000],
    equip: ['가스보일러 콘덴싱 25K', '가스보일러 일반형 20K', '가스보일러 콘덴싱 30K'],
    sym: ['점화 불량, 에러 103', '점화 안 되고 딸깍 소리만 남, 에러 103', '아침에만 점화 불량'],
    fix: [['점화봉 그을음 오염', '점화봉 청소 및 간격 조정'], ['가스 압력 부족 (중간밸브 반만 열림)', '밸브 완전 개방, 가스압 측정'], ['배기통 결로수 역류로 점화부 습기', '배기통 기울기 조정, 응축수 배관 정리']] },
  { job: '난방 배관 누수 수리', amt: [150000, 500000],
    equip: ['난방 분배기 동관', '난방 분배기 PB관', '보일러 난방 배관'],
    sym: ['분배기 아래 물 고임, 보일러 물 보충 에러', '난방 배관 누수, 아래층 천장 얼룩', '분배기 밸브에서 물 맺힘'],
    fix: [['분배기 밸브 패킹 노후', '패킹 교체, 누수 확인'], ['PB관 연결부 O링 경화', '연결부 소켓 교체'], ['동관 핀홀 부식', '부식 구간 절단 후 동관 교체 용접']] },
  { job: '급수 배관 교체', amt: [250000, 1200000],
    equip: ['PPC 급수 배관 50A', 'PPC 급수 배관 40A', 'STS 급수 배관 25A'],
    sym: ['PPC 배관 이음부 누수', '배관 이음부 누수, 수압 떨어짐', 'PPC 엘보 부위 미세 누수'],
    fix: [['융착 온도 부족으로 이음부 융착 불량', '해당 구간 절단 후 재융착, 수압 테스트'], ['배관 지지 간격 넓어서 처짐, 이음부 응력', '행거 추가 설치, 이음부 재시공'], ['STS 압착 이음 O링 씹힘', '압착 피팅 교체']] },
  { job: '부스터펌프 압력 점검', amt: [150000, 450000],
    equip: ['부스터펌프 인버터 2HP', '부스터펌프 가압 3HP', '부스터펌프 인버터 5HP'],
    sym: ['수압 안 올라감, 펌프 자주 켜졌다 꺼짐', '펌프 압력 안 오름, 계속 돌아감', '수압 들쭉날쭉, 펌프 잦은 기동'],
    fix: [['압력탱크 공기 부족', '압력탱크 공기 2.0bar 재충전'], ['압력 스위치 접점 불량', '압력 스위치 교체 후 설정압 조정'], ['흡입측 체크밸브 고장으로 역류', '체크밸브 교체']] },
  { job: '실내기 물떨어짐 수리', amt: [80000, 200000],
    equip: ['천장형 에어컨 실내기 4WAY', '천장형 에어컨 실내기 1WAY', '스탠드 에어컨 실내기'],
    sym: ['실내기 물떨어짐, 배수 안 됨', '냉방 시 실내기에서 물 떨어짐', '물떨어짐, 드레인 에러'],
    fix: [['드레인 펌프 고장', '드레인 펌프 교체, 배수 테스트'], ['배수관 슬라임 막힘', '배수관 세척, 살균제 투입'], ['배수관 구배 역경사', '배수관 구배 재시공']] },
  { job: '전열교환기 소음 수리', amt: [100000, 300000],
    equip: ['전열교환기 천장형 250CMH', '전열교환기 천장형 350CMH', '환기 전열교환기 500CMH'],
    sym: ['소음 심함, 덜덜 소리', '운전 시 쇠 긁는 소음', '풍량 약하고 소음'],
    fix: [['송풍 모터 베어링 마모', '모터 교체'], ['필터 막힘으로 과부하', '필터 교체, 소자 청소'], ['팬 임펠러 고정 볼트 풀림', '볼트 재체결, 방진고무 교체']] },
  { job: '냉각탑 점검', amt: [200000, 700000],
    equip: ['냉각탑 개방형 30RT', '냉각탑 밀폐형 50RT'],
    sym: ['냉각탑 수위 넘침', '냉각탑 수위 낮음, 냉동기 고압 경보'],
    fix: [['볼탭 고장으로 급수 안 멈춤', '볼탭 교체'], ['스트레이너 막힘으로 보충수 부족', '스트레이너 청소, 보충수 배관 점검']] },
  { job: '인버터 에러 점검', amt: [150000, 500000],
    equip: ['급기팬 인버터 7.5kW', '배기팬 인버터 5.5kW'],
    sym: ['인버터 OC 과전류 트립', '기동 시 OC 에러로 정지'],
    fix: [['모터 절연 저하 (메가 0.3MΩ)', '모터 건조 후 절연 회복 확인, 단자함 방수'], ['가속 시간 너무 짧게 설정', '가속 시간 3초→10초로 변경']] },
];

const BUYS = [['냉매 R410A 1통', '대성냉동', 180000], ['동관 3/8 15m', '수원설비자재', 95000], ['드레인 펌프', '에어컨부품몰', 68000], ['팬 모터', '대성냉동', 145000], ['점화봉 세트', '보일러부품', 32000], ['PPC 엘보·소켓 자재', '수원설비자재', 54000], ['압력 스위치', '펌프나라', 48000], ['체크밸브 40A', '펌프나라', 62000], ['질소·용접봉', '한성가스', 41000], ['패킹·O링 세트', '수원설비자재', 18000]];
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
  for (let i = 0; i < 50; i++) {
    const c = CL[i % CL.length], v = Math.floor(i / CL.length);
    const [cause, action] = c.fix[(v + i) % c.fix.length]; const site = SITES[(i * 5) % SITES.length];
    const at = new Date(now.getTime() - (2 + Math.floor(R() * 88)) * 86400000); at.setHours(9 + Math.floor(R() * 8), Math.floor(R() * 60));
    notes.push({ id: id('n'), demo: true, createdAt: at.getTime(), updatedAt: at.getTime(), who: who(), equip: c.equip[v % c.equip.length], site: site[0], symptom: c.sym[(v * 2 + i) % c.sym.length], cause, action, memo: R() < 0.3 ? '재발 시 ' + pick(['압력', '전류', '절연', '온도']) + ' 값부터 확인' : '', resolved: R() < 0.88, photos: [] });
  }

  /* 이번 달 일정: 일요일 빼고 하루 1~3건 */
  const last = new Date(Y, M + 1, 0).getDate(); let waitLeft = 2;
  for (let d = 1; d <= last; d++) {
    const dt = new Date(Y, M, d); const ds = ymd(dt); if (dt.getDay() === 0 && ds !== today) continue;
    const n = ds === today ? 3 : dt.getDay() === 6 ? 1 + Math.floor(R() * 2) : 2 + Math.floor(R() * 2); let hour = 8 + Math.floor(R() * 2);
    for (let j = 0; j < n; j++) {
      const c = pick(CL); const site = pick(SITES); const dur = 1 + Math.floor(R() * 3); const amt = ri(c.amt[0], c.amt[1]);
      let status = ds < today ? '완료' : ds > today ? '예정' : j === 0 ? '완료' : j === 1 ? '진행 중' : '예정';
      if (status === '예정' && waitLeft && R() < 0.15) { status = '자재 대기'; waitLeft--; }
      const mm = R() < 0.5 ? '00' : '30'; const s = { id: id('s'), demo: true, title: c.job, client: site[0], addr: site[1], date: ds, start: p2(hour) + ':' + mm, end: p2(Math.min(hour + dur, 20)) + ':' + mm, status, amount: amt, autoSale: true, who: who(), noteId: null, saleTxId: null, createdAt: dt.getTime(), updatedAt: dt.getTime() };
      hour = Math.min(hour + dur + 1, 17);
      if (status === '완료') {
        const t = Object.assign({ id: id('t'), demo: true, createdAt: dt.getTime(), type: 'sale', vatIncl: true, date: ds, party: site[0], memo: c.job, proof: '', who: s.who, schedId: s.id, photos: [] }, split(amt));
        txs.push(t); s.saleTxId = t.id;
        const nt = notes.find(x => !x.linked && x.equip && c.equip.includes(x.equip)); if (nt) { nt.linked = true; nt.site = site[0]; nt.createdAt = nt.updatedAt = dt.getTime() + 3600000 * (hour - 1); s.noteId = nt.id; }
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
    { id: id('m'), demo: true, by: 'me', text: '내일 동탄 물류센터 냉동창고 건은 오전 8시까지 도착 부탁해요', at: t0 - 5 * 3600000 },
    { id: id('m'), demo: true, by: by.id, text: '네 알겠습니다. 응축기 세척 장비 챙겨갈게요', at: t0 - 4.8 * 3600000 },
    { id: id('m'), demo: true, by: by2.id, text: '광교 그린마트 쇼케이스 용접부 누설 잡았습니다. 사진 트러블슈팅에 올렸어요', at: t0 - 2 * 3600000 },
  ];
  const requests = [
    { id: id('r'), demo: true, by: by.id, kind: '자재·부품', item: 'R410A 냉매', qty: '2통', schedId: wait ? wait.id : null, when: 'today', hold: !!wait, memo: '재고 다 썼어요', photo: null, status: 'new', created: t0 - 3 * 3600000 },
    { id: id('r'), demo: true, by: by2.id, kind: '공구', item: '진공펌프 게이지', qty: '1개', schedId: null, when: 'week', hold: false, memo: '게이지 바늘이 안 맞아요', photo: null, status: 'approved', created: t0 - 26 * 3600000 },
  ];
  return { notes, schedules, txs, messages, requests, team: newTeam ? { name: '도경설비', code: 'GISA-DEMO', demo: true, members: MEMBERS } : null };
}
