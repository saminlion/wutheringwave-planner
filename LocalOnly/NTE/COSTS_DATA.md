# NTE 비용 데이터 수집

게임 진행하면서 확인되는 대로 채워주세요.
완성된 항목부터 `/newgame-build` 때 반영합니다.

**작성 형식:**
- 일반 재료: `common T1 x4` / `ascension x2` / `boss x1`
- EXP 재료: `player_exp 13650` (총량)
- 재화: `credit 30000`

---

## 캐릭터 레벨업 비용

| 구간 | 재료 | 상태 |
|------|------|------|
| 1→20 | player_exp 13650, credit 30000 | ✅ |
| 20→20A | ascension T1 x5, credit 25000 | ✅ |
| 20A→30 | player_exp 213000, credit 53750 | ✅ |
| 30→30A | ascension T1 x12, boss x2, credit 50000 | ✅ |
| 30A→40 | player_exp 371000, credit 95200 | ✅ |
| 40→40A | common T2 x6, boss x8, credit 75000 | ✅ |
| 40A→50 | player_exp 576000, credit 144000 | ✅ |
| 50→50A | common T2 x12, boss x16, credit 100000 | ✅ |
| 50A→60 | player_exp 939000, credit 234750 | ✅ |
| 60→60A | common T3 x6, boss x24, credit 125000 | ✅ |
| 60A→70 | player_exp 1529000, credit 382250 | ✅ |
| 70→70A | common T3 x9, boss x36, credit 150000 | ✅ |
| 70A→80 | player_exp 2490000, credit 622500 | ✅ |

---

## 스킬 레벨업 비용

> 4개 스킬(기본공격, 바이레일 스킬, 울티메이트, 서포트 스킬) 동일 재료 사용

| 구간 | 재료 | 상태 |
|------|------|------|
| Lv1→2 | forgery T1 x2, ascension T1 x2, credit 2000 | ✅ |
| Lv2→3 | forgery T1 x3, common T1 x3, credit 5000 | ✅ |
| Lv3→4 | forgery T1 x5, common T1 x5, credit 10000 | ✅ |
| Lv4→5 | forgery T2 x2, common T2 x2, credit 20000 | ✅ |
| Lv5→6 | forgery T2 x3, common T2 x3, credit 40000 | ✅ |
| Lv6→7 | forgery T2 x5, common T2 x5, weekly x1, credit 60000 | ✅ |
| Lv7→8 | forgery T3 x3, common T3 x3, weekly x1, credit 80000 | ✅ |
| Lv8→9 | forgery T3 x5, common T3 x5, weekly x2, credit 100000 | ✅ |
| Lv9→10 | forgery T3 x8, common T3 x8, weekly x4, credit 120000 | ✅ |

---

## 스태미나 소비율 (Farming Rates)

> **구글 시트 FarmingRates 탭에서 관리합니다.**
> 파밍할 때마다 드랍량을 run_1, run_2... 열에 기록하면 평균이 자동 계산됩니다.
> sync 실행 시 `farmingRates.json`에 반영되어 Estimated Days에 사용됩니다.
>
> GOOGLE_SHEETS_GUIDE.md의 FarmingRates 탭 섹션 참조.

| 카테고리 | 관리 방식 | 스태미나 | 비고 |
|---------|---------|---------|------|
| credit | 구글 시트 샘플 기록 (run당 크레딧) | 40 | |
| common | unobtainable | - | 스태미나 파밍 없음 |
| forgery_1 | 구글 시트 샘플 기록 (T1 드랍 개수) | 40 | T2-equivalent 자동 계산 |
| forgery_2 | 구글 시트 샘플 기록 (T2 드랍 개수) | 40 | |
| forgery_3 | 구글 시트 샘플 기록 (T3 드랍 개수) | 40 | |
| boss | unobtainable | - | |
| weeklyBoss | unobtainable | - | |
| player_exp_1 | 구글 시트 샘플 기록 (아이템 개수) | 40 | 1,000 EXP/개 |
| player_exp_2 | 구글 시트 샘플 기록 (아이템 개수) | 40 | 5,000 EXP/개 |
| player_exp_3 | 구글 시트 샘플 기록 (아이템 개수) | 40 | 20,000 EXP/개 |
| weapon_exp_1 | 구글 시트 샘플 기록 (아이템 개수) | 40 | 500 EXP/개 |
| weapon_exp_2 | 구글 시트 샘플 기록 (아이템 개수) | 40 | 2,500 EXP/개 |
| weapon_exp_3 | 구글 시트 샘플 기록 (아이템 개수) | 40 | 10,000 EXP/개 |

---

## 패시브 잠금해제 비용

> 캐릭터당 패시브 2개, 각 1회 잠금해제

| 항목 | 재료 | 상태 |
|------|------|------|
| passive_1 | forgery T2 x2, weekly x1, credit 30000 | ✅ |
| passive_2 | forgery T3 x1, weekly x2, credit 40000 | ✅ |

---

## 무기 레벨업 비용

> 레어리티별로 비용이 다름. 각 등급 따로 기록.

### B등급 (3성)

| 구간 | 재료 | 상태 |
|------|------|------|
| 1→20 | | ⬜ |
| 20→20A | common T1 x2, forgery T1 x2, credit 12000 | ✅ |
| 20A→30 | | ⬜ |
| 30→30A | common T1 x6, forgery T1 x6, credit 24000 | ✅ |
| 30A→40 | | ⬜ |
| 40→40A | common T2 x4, forgery T2 x4, credit 36000 | ✅ |
| 40A→50 | | ⬜ |
| 50→50A | common T2 x8, forgery T2 x8, credit 48000 | ✅ |
| 50A→60 | | ⬜ |
| 60→60A | common T3 x4, forgery T3 x4, credit 60000 | ✅ |
| 60A→70 | | ⬜ |
| 70→70A | common T3 x8, forgery T3 x8, credit 72000 | ✅ |
| 70A→80 | | ⬜ |

### A등급 (4성)

| 구간 | 재료 | 상태 |
|------|------|------|
| 1→20 | | ⬜ |
| 20→20A | common T1 x3, forgery T1 x3, credit 16000 | ✅ |
| 20A→30 | | ⬜ |
| 30→30A | common T1 x8, forgery T1 x8, credit 32000 | ✅ |
| 30A→40 | | ⬜ |
| 40→40A | common T2 x5, forgery T2 x5, credit 48000 | ✅ |
| 40A→50 | | ⬜ |
| 50→50A | common T2 x10, forgery T2 x10, credit 64000 | ✅ |
| 50A→60 | | ⬜ |
| 60→60A | common T3 x5, forgery T3 x5, credit 80000 | ✅ |
| 60A→70 | | ⬜ |
| 70→70A | common T3 x10, forgery T3 x10, credit 96000 | ✅ |
| 70A→80 | | ⬜ |

### S등급 (6성)

| 구간 | 재료 | 상태 |
|------|------|------|
| 1→20 | weapon_exp 39000, credit 12000 | ✅ |
| 20→20A | common T1 x4, forgery T1 x4, credit 20000 | ✅ |
| 20A→30 | weapon_exp 96000, credit 30000 | ✅ |
| 30→30A | common T1 x10, forgery T1 x10, credit 40000 | ✅ |
| 30A→40 | weapon_exp 199500, credit 50000 | ✅ |
| 40→40A | common T2 x6, forgery T2 x6, credit 60000 | ✅ |
| 40A→50 | weapon_exp 344950, credit 70000 | ✅ |
| 50→50A | common T2 x12, forgery T2 x12, credit 80000 | ✅ |
| 50A→60 | weapon_exp 546000, credit 90000 | 🟡추정 |
| 60→60A | common T3 x6, forgery T3 x6, credit 100000 | ✅ |
| 60A→70 | weapon_exp 789000, credit 110000 | 🟡추정 |
| 70→70A | common T3 x12, forgery T3 x12, credit 120000 | ✅ |
| 70A→80 | weapon_exp 1078500, credit 130000 | 🟡추정 |
