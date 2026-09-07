# Simple Design System 참조 인덱스

GatsBlog 와이어프레임 제작 시 참조하는 디자인 시스템 컴포넌트 목록. 화면을 그리기 전에 이 표에서 대응 컴포넌트를 먼저 찾는다.

## 파일 정보

| 항목 | 값 |
|------|-----|
| 파일명 | Simple Design System (Community) |
| File Key | `zuvyejbTUvvu28tNOIujxp` |
| 원본 | https://www.figma.com/design/zuvyejbTUvvu28tNOIujxp/Simple-Design-System--Community- |
| 노드 링크 규칙 | 원본 URL 뒤에 `?node-id={id}`, id의 `:`는 `-`로 치환 (`348:15896` → `?node-id=348-15896`) |
| 스캔 일자 | 2026-09-07 |

**핵심**: 대부분의 Sections 컴포넌트가 `Platform = Desktop / Mobile` variant를 갖는다. web/mobile 와이어프레임을 같은 컴포넌트에서 variant만 바꿔 뽑을 수 있다.

## 키가 두 종류다 — 임포트에는 게시 키를 쓴다

위 `zuvyejbTUvvu28tNOIujxp`는 커뮤니티 파일의 **사본**이고, 아래 표들의 key는 그 사본 캔버스에 있는 노드의 key다. **`importComponentSetByKeyAsync`에는 통하지 않는다** — "not found"가 난다.

임포트에 쓰는 것은 게시된 라이브러리의 key다.

| 항목 | 값 |
|------|-----|
| 라이브러리명 | Simple Design System |
| Library Key | `lk-e0ffcff14368019c4f30f45401cd233d6cbc5f869988484192d04cbbef801fb0064ef68feaa8a2775ee4f1f05d9a4af1a6d07b2658eac4aefb7afb18728c4066` |
| 조회 방법 | `search_design_system`에 `includeLibraryKeys`로 위 키를 넘겨 이름 검색 |

이 라이브러리는 상세기획 파일(`wsLPU5JDsN67AAutcUBGeO`)에 이미 추가돼 있다.

### 확보한 게시 키 (임포트용)

와이어프레임 제작에 실제로 쓴 것들. 여기 없는 컴포넌트는 `search_design_system`으로 조회한다.

| 컴포넌트 | 타입 | 게시 key |
|----------|------|----------|
| Header | set | `a1f69d8fdde4a1fe8523e49d3baa3c8464ad17d2` |
| Header Auth | set | `4129103108b4aa1b535044a60f2379f362254a6c` |
| Footer | set | `1718e04cd9e38ae64c8fdeec6fdac2dad0a133c4` |
| Hero Basic | set | `54e6189d0df062b7df6b370811f154ae24eed832` |
| Hero Actions | set | `e621f344361fccdf1c61c834825776e7e224cc73` |
| Hero Image | set | `6fb5ec3698da245adf641fda0c62494c73d1b88a` |
| Hero Form | set | `492255427240f60f3d94b62d04eb4eb9bc66aba1` |
| Hero (Slot) | set | `f03243fcf7dae95962d6a876fbdc4046b0d6307f` |
| Hero Newsletter | set | `d609ffc1fc77b4cdd6b9b11c31e1e0874dc59f02` |
| Card Grid Icon | set | `618041c057b7b9b525fa74cdb3a4c21c1e0e5c60` |
| Card Grid Image | set | `39e1cba84417660804816cb9b918c712ee3ad430` |
| Card Grid Content List | set | `2fc21ed99318915a80e678384f2684a29434a29e` |
| Card Grid Testimonials | set | `b4cf04e380849c77e2ed79bcb34c166acc1094f4` |
| Card Grid Reviews | set | `5c6c9be8b88722cb5329a4eea5e5fdab038b63de` |
| Card Grid Pricing | set | `9750fd6fdc811dcf95bfc4572065be5954e4414e` |
| Card | set | `a5bde480886231526d7dd890df3779dc15b52423` |
| Card (Slot) | 단일 | `938ddbc1add07bdc6bbec6388327aa27d9d04868` |
| Product Info Card | 단일 | `3827f899660a77038ee7cf6815d3750a6bf68208` |
| Stats Card | 단일 | `7b01e43596110132560308669a4d91d2af023e23` |
| Testimonial Card | 단일 | `334eebbb175dbcf1431620d19e7f5889a609baa4` |
| Review Card | 단일 | `55332af5095f870a3a46092bfa09d8bb8db5ced4` |
| Page Product | set | `5de775410ab15a14457ec13f3f5087cb217b85b5` |
| Page Product Results | set | `5b7c256a4dc2b6a40b0afd1da162ac8a66906c56` |
| Panel Image Content | set | `64ff77d5f5fb60e61045481e9808d06dd2997024` |
| Panel Image Content Reverse | set | `a1a8d526d9e418344e27698aa5174e5fef2d4cb9` |
| Panel Image | set | `d9eb541a14bc8addcf8b37e60fa4b809e4a963d0` |
| Panel Image Double | set | `dfc1a832e78813ad0a1dc132967c41b4b8ad23f3` |
| Button | set | `cc8b558dc7d9684011b6b99ce8e6509399bc836b` |
| Icon Button | set | `e098805c9e6db6bfa6a87de61a8324a545d42501` |
| Button Group | set | `97bcba06a0df2ebfe08cd2efa567d04536ace541` |
| Button Danger | set | `3d3073170c1014cfacc5d047c23495cfed01e0a8` |
| Navigation Button | set | `1d2523aed78254402984bbbffdf9010d30b6f35c` |
| Navigation Button List | set | `e1c85c58e096211df7e79057a9b819f01dde8ca6` |
| Tab | set | `18aa207708b43593a2af7096b2dfd531553f3414` |
| Tabs | 단일 | `b839f8a495ef7b0ef0a47ad1aefd6e05438825b5` |
| Text Content Heading | set | `bf3727dbf46edfa6bc795ded383a7fe49536fece` |
| Text Content Title | set | `d65373ea6b62534a87c1ced2f7b0557126e02e91` |
| Text Heading | 단일 | `035ac61042305c533b39b786ff35ab1164bdd068` |
| Text Title Hero | 단일 | `567413869053d25fd381b0cc00a288dc3db00695` |
| Pagination | 단일 | `b86dd6cf2e3f4ecc779a4f2d203b580900e60527` |
| Pagination List | 단일 | `4cabc3e074c681da385d090a92c971c7b0c73ef0` |
| Pagination Page | set | `f0ba3b2fd93c9fc851ce088d7190a78b7fe83b0f` |
| Form Log In | 단일 | `4542bc57d5ddbef80997e7cc5aa5309fc28fe151` |
| Form Register | 단일 | `778956067cb1729662373f858784a16c5ba5ab43` |
| Form Contact | 단일 | `182b34d6a03dcd59ca280b3dffd70edcb15f4779` |
| Form Newsletter | 단일 | `e539e8956abd4a19f701c574c9af7e5f44a8aefd` |
| Form Forgot Password | 단일 | `849d5b5ed4e38a7affb7b961b32089bb46d76f49` |
| Form (Slot) | 단일 | `7d52c70f38d09aadd8c54920cddf611f7a852c58` |
| Dialog Body | set | `629a55849475c74b3aeea85d7de846e271cf504f` |
| Grid | set | `1a1cfa80ed0d51cb7e59c8d3f7a177f83167cc57` |
| Menu Header | 단일 | `00989172b727144dade8b96bc864ec0b949faab2` |

아래 표들의 key는 **사본 캔버스 기준**이다. variant 축과 콘텐츠 슬롯 구조를 확인하는 용도로만 쓴다.

## 페이지 인덱스

| # | 페이지 | 성격 | 세트 | 컴포넌트 | node-id |
|---|--------|------|------|----------|---------|
| 1 | Cover | 표지 | 0 | 0 | 3-5 |
| 2 | Foundations | 토큰·파운데이션 | 0 | 0 | 9762-187 |
| 3 | Icons | 아이콘 | 0 | 1722 | 7809-18809 |
| 4 | Examples | 완성 예시 | 12 | 24 | 7641-2142 |
| 5 | Composition guide | 조합 가이드 | 0 | 0 | 83-32628 |
| 6 | Accordion | 컴포넌트 | 1 | 3 | 128-10528 |
| 7 | AI Chat | 컴포넌트 | 1 | 7 | 4309-529 |
| 8 | Avatars | 컴포넌트 | 2 | 15 | 128-10526 |
| 9 | Buttons | 컴포넌트 | 4 | 53 | 128-10284 |
| 10 | Calendar | 컴포넌트 | 1 | 11 | 4333-9150 |
| 11 | Cards | 컴포넌트 | 2 | 17 | 2143-13485 |
| 12 | Dialog | 컴포넌트 | 1 | 3 | 128-10421 |
| 13 | Inputs | 컴포넌트 | 10 | 52 | 128-10423 |
| 14 | Menu | 컴포넌트 | 1 | 8 | 87-18810 |
| 15 | Navigation | 컴포넌트 | 4 | 19 | 516-12822 |
| 16 | Notification | 컴포넌트 | 1 | 2 | 128-10527 |
| 17 | Pagination | 컴포넌트 | 3 | 13 | 128-10525 |
| 18 | Tabs | 컴포넌트 | 1 | 5 | 128-11109 |
| 19 | Tags | 컴포넌트 | 2 | 23 | 128-10523 |
| 20 | Text | 컴포넌트 | 5 | 23 | 368-11410 |
| 21 | Tooltip | 컴포넌트 | 1 | 4 | 280-23459 |
| 22 | Forms | 조합 블록 | 0 | 7 | 370-5433 |
| 23 | Sections | 조합 블록 | 24 | 50 | 348-13000 |
| 24 | Utilities | 헬퍼 | 2 | 15 | 7809-18808 |
| 25 | Component Playground | 샘플 | 0 | 0 | 522-12151 |

`---` 이름의 구분자 페이지 4개는 제외.

## Variant 프로퍼티 읽는 법

컴포넌트 세트의 프로퍼티는 두 종류다. 조립 방식이 갈리므로 반드시 구분한다.

- **상태·스타일 축** — 접미사 없음(`Variant`, `State`, `Size`, `Platform`, `Direction`, `Type`, `Align`, `Scheme`, `Density`, `Active`, `Placement`, `Shape`, `Device`, `Value Type`). variant 이름 매칭으로 고른다.
- **콘텐츠 슬롯** — `#숫자:숫자` 접미사(`Label#2:0`, `Heading#280:0`). 인스턴스 생성 후 `setProperties()`로 덮어쓴다.

아래 표에서 두 열로 나눠 적었다.

## Sections — 화면 조립용 블록 (최우선 활용)

화면 단위로 바로 쓰는 블록. **`Platform` 축이 Desktop/Mobile이므로 web/mobile 와이어프레임 모두 이 세트에서 나온다.**

| 세트 | Variant | 상태·스타일 축 | 콘텐츠 슬롯 | key |
|------|---------|----------------|-------------|-----|
| Header | 3 | Platform, State(Open/Default) | — | `a56be785e34467dc2914a9aba8de56f2204c01aa` |
| Header Auth | 3 | State | — | `7d639219e33435e7543115303cf31870d73dab09` |
| Footer | 2 | Platform | Slot, Title | `6069f0c0a66a3bbd337e9c6e57fba8ddaef7a173` |
| Hero Basic | 2 | Platform | — | `5b222ce68428679a082861c65d87546391fa2911` |
| Hero Actions | 2 | Platform | — | `9ac5b59d1b7edb5f75093262d21d81897737d038` |
| Hero Image | 2 | Platform | — | `2d41415bbf85e80469d30ec53e6ae1fef7015dd6` |
| Hero Form | 2 | Platform | — | `9e0a19ee6050fedba1eb4771ce4897f4c03b3748` |
| Hero Newsletter | 2 | Platform | — | `189e6d8eb362f90b0b419bbb022b56846e964337` |
| Hero (Slot) | 2 | Platform | Slot | `aba0669f4f69132c277b9a86faa5e750de547d38` |
| Card Grid Icon | 2 | Platform | Cards | `82316fbdc36c84af9c4f2f2b860fc51a749e6ba2` |
| Card Grid Image | 2 | Platform | Slot | `7f74940cebba0e3ac6706f66ffa7a04e18cd5649` |
| Card Grid Content List | 2 | Platform | Cards | `49c9328af17b5ad90fdcb41a6a5bbd50259d3154` |
| Card Grid Testimonials | 2 | Platform | Card Grid | `c474c7ad3b4a5e217d1344b03ce1c9cb7bee61be` |
| Card Grid Reviews | 2 | Platform | — | `149898428cf8e60e115155148b68efcc3a6171b6` |
| Card Grid Pricing | 2 | Platform | Card Grid | `16d32cec1b2f2170e222402f7db49937a592f7a4` |
| Page Product | 2 | Platform | Column | `98612db447096b4473747d2635c365122249f123` |
| Page Product Results | 2 | Platform | Slot, Card Grid | `e2034be270e9294df032db6b40ac17b8cc386577` |
| Page Accordion | 2 | Platform | — | `ab8f2e3fc2ee3b991ce80e45579b805f4cfce9e9` |
| Page Newsletter | 2 | Platform | — | `3ebf9b0446910ad0adfbd944e461ccdc0b04a615` |
| Panel Image Content | 2 | Platform | Text Content Flow | `b5041259fef3b5e9f328e05ccb4d1411997e30df` |
| Panel Image Content Reverse | 2 | Platform | Text Content Flow | `86e893e72dbaca78f7310f85fdcd09be7491d442` |
| Panel Image | 2 | Platform | — | `4896e27bb348ee5213534495bd9032c4b474ce94` |
| Panel Image Double | 2 | Platform | — | `e651d37a8764eda653b189d54921a8350c8896d0` |
| AI Chatbot | 2 | Device(Desktop/Mobile) | — | `4385a7b91fc7164052ab59f157c4c7db2f912944` |

## Forms — 폼 블록

세트 없이 단일 컴포넌트 7종.

| 컴포넌트 | key |
|----------|-----|
| Form Log In | `8c496aad487e5161acf266d470bbb3334a6def7b` |
| Form Register | `a63c4b3c4c01f759d5589ef8988d1410d2d29f25` |
| Form Forgot Password | `9b757bfda6368d781e37d92e58d93a259be90e62` |
| Form Contact | `5b1d65c924c0c6e80da2278d6146e097e2a96a25` |
| Form Newsletter | `fc6fbcff540a06c20f056f8ccd5f48d34e1f699c` |
| Form Shipping | `11e7baf47ffc6b1496eec0771497aaf65f8518e7` |
| Form (Slot) | `15da73cb8b5d47c5f435c363ef058fdf9048ecbf` |

## 개별 컴포넌트 세트

### Navigation

| 세트 | Variant | 상태·스타일 축 | 콘텐츠 슬롯 | key |
|------|---------|----------------|-------------|-----|
| Navigation Button | 12 | State, Direction, Type | Label, Icon, Has Icon, Has Label | `6bd82c50b9137db1904eee23ca7edf9f3941e048` |
| Navigation Button List | 2 | Direction | Link 1~5, Slot | `305656e005919bb8e7200ee1c13204084bbce2f7` |
| Navigation Pill | 3 | State | Label | `c3e55d301f5d3b982edf6b979933b33ddba5fddf` |
| Navigation Pill List | 2 | Direction | Link 1~7, Slot, Slot 2 | `a04be72ce1accebbdc0d8446c1e60d6b092af404` |

### Tabs

| 세트 | Variant | 상태·스타일 축 | 콘텐츠 슬롯 | key |
|------|---------|----------------|-------------|-----|
| Tab | 4 | State, Active | Label | `222ff024e39a85c114356e6c9bfe5f3462ebb27a` |
| Tabs (단일) | — | — | — | `765bf00eae78b3dac499cafc2fe4fbe7d628552f` |

### Buttons

| 세트 | Variant | 상태·스타일 축 | 콘텐츠 슬롯 | key |
|------|---------|----------------|-------------|-----|
| Button | 18 | Variant, State, Size | Label, Icon Start/End, Has Icon Start/End | `d1436a2670b354548f2060533cd8377621504fee` |
| Icon Button | 18 | Variant, State, Size | Icon | `4cb2d4959737fbc42a1981f58b75c8c931095477` |
| Button Danger | 12 | Variant, State, Size | Label, Icon Start/End | `deb74b1354fbbea3944956d1be20e3ef27521f0d` |
| Button Group | 5 | Align | Button Start, Button End | `58a68d708c998c08b9b441283b4e16b69c6c6f55` |

### Cards

| 세트 | Variant | 상태·스타일 축 | 콘텐츠 슬롯 | key |
|------|---------|----------------|-------------|-----|
| Card | 8 | Asset Type, Variant, Direction | Asset, Button, Heading, Body, Body2, Icon | `50087f3f5a4c35f2038fd656076145c5b356db9d` |
| Pricing Card | 4 | Device, Variant | — | `8fd3daf08ed195c1297cc469106165f87c2f43d5` |

단일 컴포넌트: Product Info Card `7d1bec08ed54404fb35806da53b3bd39c7881900`, Testimonial Card `2c83f8e398a94ba8705cd7931bd0e6402043aada`, Stats Card `bb971de319b6895ec5cd2ba7644e87060e9f29df`, Review Card `4d6928cdd70bbe018e7ad3a4b0e6a563fb31fa33`, Card (Slot) `0c002e2ec2e4fc49461aa96ce8d23ae8fc53d11a`

### Text

| 세트 | Variant | 상태·스타일 축 | 콘텐츠 슬롯 | key |
|------|---------|----------------|-------------|-----|
| Text Content Heading | 2 | Align | Heading, Subheading, Has Subheading | `195bc8474bd69494049ba745f4d29b254427f032` |
| Text Content Title | 2 | Align | Title, Subtitle, Has Subtitle | `2fcbb38d4a718884a07efbc07db64ca373a30a13` |
| Text Link List | 2 | Density | Has Title, Slot | `ecae125342ba989ceedddbfbb9f6ae7930bcdebc` |
| Text List | 2 | Density | Has Title, Slot | `a5949fed2413e33f648c1ac568a101ce00c22046` |
| Text Price | 2 | Size | Price, Label, Currency, Has Label | `e1ef85f5133404afd790b6d9ab0ac92128f3f474` |

타이포 단일 컴포넌트: Text Title Hero, Text Title Page, Text Subtitle, Text Heading, Text Subheading, Text, Text Small, Text Strong, Text Emphasis, Text Link, Text Code, Text List Item, Text Link List Item

### Inputs

| 세트 | Variant | 상태·스타일 축 | 콘텐츠 슬롯 | key |
|------|---------|----------------|-------------|-----|
| Input Field | 6 | State, Value Type | Label, Value, Error, Description + Has 플래그 | `916cc4ab90e1d83a0abac784df15e1f8ef68c02f` |
| Textarea Field | 6 | State, Value Type | Label, Value, Error, Description | `da17593d9554d0d6eaa9e2bfc612d31ec7a08452` |
| Select Field | 6 | State, Value Type | Label, Value, Error, Description, Open | `2aacca730f899738dcc5a070115eac74a0e8904d` |
| Search | 4 | State, Value Type | Value | `25085a5c709c6fcf7b2d31feb744b6c094024725` |
| Checkbox Field | 6 | State, Value Type | Label, Description | `79e9ce71ad7c8f138c006e627f21caafe9d21715` |
| Radio Field | 4 | State, Value Type | Label, Description | `ae75556661261cc76b1a0f765b25cb2eb9d63f0b` |
| Switch Field | 4 | State, Value Type | Label, Description | `83c161a033cf76cf310ba94dc65beaaa3183a75c` |
| Slider Field | 2 | State | Label, Description | `b6c50a993b44423456c007b32a87a473793dae4d` |
| Date Picker Field | 6 | State, Value Type | Label, Value, Error, Description | `d62b968f5925338ebb5c73d2a6a785cc4adabadb` |
| Date Input Field | 6 | State, Value Type | Day, Month, Year, Label, Error | `06c7032be0685fd0b1124579c70cf997458c8ea4` |

### 그 외

| 세트 | Variant | 상태·스타일 축 | 콘텐츠 슬롯 | key |
|------|---------|----------------|-------------|-----|
| Tag | 20 | Scheme, State, Variant | Label, Removable | `11e445d32da50f5962a4aec2a65771c3091e67a3` |
| Tag Toggle | 2 | State | Label, Icon, Show Icon | `70e4f939e0bc5ef21231719a2369085f94383acf` |
| Accordion Item | 2 | State | Title, Content | `cb43a59ccce9c2c13bef970686fb0e0f33ebbc00` |
| Menu Item | 3 | State | Label, Description, Icon, Shortcut + Has 플래그 | `cbe7b3037f784d87eace45a453586d53e0ca5f34` |
| Dialog Body | 2 | Type | Heading, Body, Dismissible, Slot, Slot 2 | `a5002ea923324f48dabffe125f067a7fde5e4b08` |
| Notification | 2 | Variant | Title, Body, Icon, Dismissible, Has Button | `906400a8775da51ad3b24607351f79d2d0f501ba` |
| Tooltip | 4 | Placement | Title, Body, Has Body, Slot | `97d48b5f0bae3e41e226b3bc2f37c48582b879d6` |
| Avatar | 12 | Type, Size, Shape | Initials | `39c5a4f1849e60652a5031a15c3d0af8a8904097` |
| Avatar Group | 2 | Spacing | Avatars, Number, Show Overflow | `11cd5fac86a839cfc4495c0bc962df4cbc9e1a34` |
| Pagination Page | 4 | State | Number | `0d0c240b9227b1386caba6317c2541631e961ca3` |
| Pagination Next | 3 | State | — | `59ea18bf15c155dc2cef418b7d49bb10160690e3` |
| Pagination Previous | 3 | State | — | `322ee6b4f80f8ff8efcb9815408841c3ae983a10` |
| Calendar Button | 7 | State | Number | `ebb47bfb44808a54be632f9957f52226e8ba7835` |
| AI Chat Box | 2 | State | — | `012fcd19b3cea3f9394739ffebc282c3f24ca969` |

AI Chat 단일: AI Sidebar `4fe0cf169f816714cc7bb544ffb1a3eff2aa5c9a`, Chat Response `37c2c8a470aba39e088565ed3702f91d89a1b490`, User message `de8e784631e15533e2d9cfe0b00a333481750107`, Code Block `203442def3c9e01ee946545384167b53d60c12d7`, Conversation `f97f5d9a2106a7d2f3259e71b03de5b14ee470fa`

## 토큰 요약

| 컬렉션 | 모드 | 개수 | 네이밍 |
|--------|------|------|--------|
| Color Primitives | Value | 100 | `{Brand,Black,White,Gray,Slate,Green,Blue,Red,Pink,Yellow}/100~1000` |
| Color | SDS Light, SDS Dark | 136 | `Background/*`(41), `Text/*`(37), `Icon/*`(37), `Border/*`(21) — 예: `Background/Neutral/Hover` |
| Typography Primitives | Default | 31 | `Family {Sans,Serif,Mono}`, `Scale 01~10`, `Weight Thin~Black` (+Italic) |
| Typography | Mode 1 | 35 | `{Title Hero,Title Page,Subtitle,Heading,Subheading,Body,Code}/{Font Family,Size,Font Weight}` |
| Size | Default | 41 | `Space/0~`(18), `Depth/*`(13), `Radius/*`(4), `Icon/*`(3), `Stroke/*`(2), `Blur`(1) |
| Responsive | Desktop, Mobile, Tablet | 4 | `Device`, `Device Width`, `Root Font Size`, `Scale` |

색상은 다크모드가 `Color` 컬렉션의 `SDS Dark` 모드로 이미 정의돼 있다. 반응형은 `Responsive` 컬렉션 모드 전환으로 처리한다.

## 아이콘

`Icons` 페이지에 1722개. 크기별 섹션으로 나뉜다.

| 섹션 | 크기 |
|------|------|
| 16 / 20 / 24 / 32 / 40 / 48 | px |

개별 나열은 하지 않는다. 필요한 아이콘은 `search_design_system`으로 이름 검색해 key를 얻는다.

## 완성 예시 (Examples 페이지)

와이어프레임 레이아웃 참고용. 12종.

| 예시 |
|------|
| Home Page, Landing Page, About, Contact Us, Pricing, Waitlist, Article, Shop, Product Detail Page, Portfolio, AI Chat, Slot |

GatsBlog 화면과의 대응은 `docs/wireframe-plan.md`에 정리한다.

## 사용 순서

1. **토큰** — 색·간격·타이포는 위 컬렉션 변수를 쓴다. 하드코딩 금지.
2. **Sections 블록** — Header / Hero / Card Grid / Panel / Footer로 화면 뼈대를 먼저 세운다. `Platform` variant로 web·mobile을 가른다.
3. **개별 컴포넌트** — Sections로 안 채워지는 자리에 Button, Card, Tag, Input, Tabs를 넣는다.
4. **Examples** — 배치가 막히면 대응되는 예시 페이지의 구조를 참고한다.
5. 대응 컴포넌트가 없어 새로 만들었다면 이 문서 하단에 기록한다.

## 신규 제작 기록

(없음)
