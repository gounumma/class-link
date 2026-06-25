insert into public.courses (id, title, subject, grade_level, short_description, full_description, schedule_text, price_text, is_published, is_featured, sort_order)
values
  ('11111111-1111-4111-8111-111111111111', '중등 수학, 개념부터 자신감까지', '수학', '중1–중3', '빈틈을 진단하고 개념과 문제 해결력을 차근차근 쌓는 1:1 수업', '학생의 현재 학습 수준과 오답 패턴을 먼저 진단합니다. 핵심 개념을 학생의 언어로 다시 설명하고, 유형별 문제와 주간 복습을 통해 흔들리지 않는 수학 기본기를 만듭니다.\n\n매 수업 후 학습 리포트와 다음 주 과제를 안내해 보호자와도 학습 과정을 투명하게 공유합니다.', '주 2회 · 회당 90분 · 시간 협의', '월 480,000원', true, true, 1),
  ('22222222-2222-4222-8222-222222222222', '초등 영어 리딩 & 스피킹', '영어', '초3–초6', '즐겁게 읽고 자연스럽게 말하며 영어 감각을 키우는 맞춤 수업', '레벨에 맞는 원서 리딩과 일상 주제 스피킹을 함께 진행합니다. 단어 암기에 머물지 않고 문맥 속에서 이해하고 자신의 문장으로 표현하는 힘을 기릅니다.', '주 2회 · 회당 60분 · 평일 오후', '월 360,000원', true, true, 2),
  ('33333333-3333-4333-8333-333333333333', '고등 국어 내신 집중반', '국어', '고1–고2', '학교별 출제 경향과 작품 분석을 연결하는 꼼꼼한 내신 대비', '학교별 교과서와 부교재를 바탕으로 문학 작품의 핵심 맥락, 비문학 독해 전략, 서술형 답안 작성법을 훈련합니다.', '주 1회 · 회당 120분 · 토요일', '월 420,000원', true, true, 3)
on conflict (id) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  is_published = excluded.is_published,
  is_featured = excluded.is_featured;
