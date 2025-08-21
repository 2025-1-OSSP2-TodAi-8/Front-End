# TodAi – 감정 분석 모바일 앱 (Front-End)
[![React Native](https://img.shields.io/badge/React%20Native-0.7x-blue)]()
[![Platform](https://img.shields.io/badge/Android-iOS-informational)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)]()

> 사용자의 음성/일기 데이터를 바탕으로 감정을 분석하고, 캘린더/그래프로 시각화하여 일상 감정 변화를 쉽게 확인할 수 있는 앱입니다.  
> (대회 소개용 한 줄을 너희 스타일로 더 임팩트 있게 수정해도 좋아요)

---

## 🔥 핵심 기능
- 음성/텍스트 기반 **감정 분석**
- **감정 캘린더** & 일간/월간 요약
- **그래프 시각화**(파이/레이더 등)
- (선택) **보호자 공유/알림** 기능

스크린샷  
![메인화면](docs/screenshot-main.png)
![감정그래프](docs/screenshot-graph.png)

---

## 🏗 아키텍처 & 기술스택
- **App**: React Native (TypeScript)
- **State/Utils**: (예: Zustand/Recoil/Context)
- **API 레이어**: `api/` (Axios 등)
- **네이티브**: `android/`, `ios/`
- 폴더 구조(요약):
