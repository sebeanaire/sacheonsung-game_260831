```javascript
/* =====================================================
   사천성 게임
   JavaScript
===================================================== */


/* =====================================================
   게임 타일 데이터
===================================================== */

const themes = {

  /* 화투 */
  hwatu: [

    ["🌸", "매화"],
    ["🌸", "벚꽃"],
    ["🌿", "난초"],
    ["🎋", "대나무"],
    ["🌼", "국화"],
    ["🍁", "단풍"],
    ["🌺", "홍단"],
    ["🌊", "청단"],
    ["☀️", "광"],
    ["🌙", "광"]

  ],


  /* 카드 */
  card: [

    ["🂡", "A"],
    ["🂮", "K"],
    ["🂭", "Q"],
    ["🂫", "J"],
    ["🂪", "10"],
    ["🂩", "9"],
    ["🂨", "8"],
    ["🂧", "7"],
    ["🂦", "6"],
    ["🂥", "5"]

  ],


  /* 과일 */
  fruit: [

    ["🍎", "사과"],
    ["🍓", "딸기"],
    ["🍇", "포도"],
    ["🍌", "바나나"],
    ["🍊", "오렌지"],
    ["🍉", "수박"],
    ["🍍", "파인애플"],
    ["🥝", "키위"],
    ["🍋", "레몬"],
    ["🍒", "체리"]

  ],


  /* 동물 */
  animal: [

    ["🐱", "고양이"],
    ["🐶", "강아지"],
    ["🐰", "토끼"],
    ["🐼", "판다"],
    ["🐧", "펭귄"],
    ["🦁", "사자"],
    ["🐘", "코끼리"],
    ["🐸", "개구리"],
    ["🦊", "여우"],
    ["🐻", "곰"]

  ],


  /* 캐릭터 */
  character: [

    ["👧", "소녀"],
    ["👦", "소년"],
    ["🧑", "아이"],
    ["👨‍🎓", "학생"],
    ["👩‍🎓", "학생"],
    ["🧑‍🍳", "요리사"],
    ["🧑‍🚀", "우주인"],
    ["🧙", "마법사"],
    ["🧝", "요정"],
    ["🦸", "영웅"]

  ]

};


/* =====================================================
   DOM
===================================================== */

const board =
  document.querySelector("#board");

const scoreEl =
  document.querySelector("#score");

const timeEl =
  document.querySelector("#time");

const hintEl =
  document.querySelector("#hint");

const undoEl =
  document.querySelector("#undo");

const levelEl =
  document.querySelector("#level");

const message =
  document.querySelector("#message");

const target =
  document.querySelector("#target");


/* =====================================================
   게임 상태
===================================================== */

let state = {

  level: 1,

  score: 0,

  time: 300,

  hint: 3,

  undo: 3,

  tiles: [],

  selected: null,

  history: [],

  timer: null,

  theme: "all",

  sound: true

};


/* =====================================================
   레벨별 타일 수
===================================================== */

function pairsForLevel() {

  return Math.min(
    40,
    12 + state.level * 4
  );

}


/* =====================================================
   타일 생성
===================================================== */

function makeDeck() {

  let pool;


  if (state.theme === "all") {

    pool =
      Object.values(themes).flat();

  } else {

    pool =
      themes[state.theme];

  }


  const need =
    pairsForLevel();


  let arr = [];


  for (
    let i = 0;
    i < need;
    i++
  ) {

    const item =
      pool[i % pool.length];


    const first = {

      id:
        crypto.randomUUID(),

      pair:
        i,

      symbol:
        item[0],

      name:
        item[1],

      theme:
        state.theme === "all"
          ? Object.keys(themes)
              .find(
                key =>
                  themes[key].includes(item)
              )
          : state.theme

    };


    const second = {

      ...first,

      id:
        crypto.randomUUID()

    };


    arr.push(first);

    arr.push(second);

  }


  /* 랜덤 섞기 */

  return arr.sort(
    () => Math.random() - 0.5
  );

}


/* =====================================================
   새 게임
===================================================== */

function newGame(resetScore = true) {

  clearInterval(
    state.timer
  );


  if (resetScore) {

    state.score = 0;

    state.hint = 3;

    state.undo = 3;

  }


  state.time = 300;

  state.selected = null;

  state.history = [];

  state.tiles =
    makeDeck();


  render();


  state.timer =
    setInterval(
      tick,
      1000
    );

}


/* =====================================================
   타이머
===================================================== */

function tick() {

  state.time--;


  renderStats();


  if (state.time <= 0) {

    clearInterval(
      state.timer
    );

    finish(false);

  }

}


/* =====================================================
   점수 / 상태 표시
===================================================== */

function renderStats() {

  scoreEl.textContent =
    state.score;


  hintEl.textContent =
    state.hint;


  undoEl.textContent =
    state.undo;


  levelEl.textContent =
    state.level;


  const minutes =
    Math.floor(
      state.time / 60
    );


  const seconds =
    state.time % 60;


  timeEl.textContent =

    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


/* =====================================================
   화면 렌더링
===================================================== */

function render() {

  board.innerHTML = "";


  state.tiles.forEach(
    (t, i) => {

      const el =
        document.createElement(
          "button"
        );


      el.className =
        "tile";


      if (t.removed) {

        el.classList.add(
          "removed"
        );

      }


      if (
        state.selected === i
      ) {

        el.classList.add(
          "selected"
        );

      }


      el.dataset.i =
        i;


      el.innerHTML = `

        <small>
          ${t.theme}
        </small>

        <span>
          ${t.symbol}
        </span>

      `;


      el.title =
        t.name;


      el.onclick =
        () => choose(i);


      board.appendChild(el);

    }
  );


  renderStats();


  const alive =
    state.tiles.filter(
      t => !t.removed
    );


  if (alive[0]) {

    target.innerHTML = `

      <div class="target-card">

        ${alive[0].symbol}

      </div>

    `;

  } else {

    target.innerHTML = "";

  }

}


/* =====================================================
   카드 선택
===================================================== */

function choose(i) {

  const t =
    state.tiles[i];


  if (t.removed) {

    return;

  }


  /* 첫 번째 선택 */

  if (
    state.selected === null
  ) {

    state.selected = i;

    message.textContent =
      "짝이 되는 카드를 선택하세요.";

    render();

    return;

  }


  /* 같은 카드를 다시 클릭 */

  if (
    state.selected === i
  ) {

    state.selected = null;

    render();

    return;

  }


  const a =
    state.tiles[
      state.selected
    ];


  const b =
    t;


  /* 짝이 맞는 경우 */

  if (
    a.pair === b.pair
  ) {

    state.history.push([

      state.selected,
      i

    ]);


    a.removed = true;

    b.removed = true;


    state.score += 100;


    state.selected = null;


    message.textContent =
      "짝 맞추기 성공! +100점";


    render();


    if (
      state.tiles.every(
        x => x.removed
      )
    ) {

      finish(true);

    }

  }


  /* 짝이 안 맞는 경우 */

  else {

    message.textContent =
      "같은 그림의 짝이 아닙니다.";


    state.selected = null;


    render();

  }

}


/* =====================================================
   게임 종료
===================================================== */

function finish(win) {

  clearInterval(
    state.timer
  );


  setTimeout(
    () => {

      if (win) {

        openModal(`

          🎉 레벨 ${state.level} 클리어!

          <br>

          점수: ${state.score}점

        `);

      } else {

        openModal(`

          ⏰ 시간이 끝났습니다.

          <br>

          점수: ${state.score}점

        `);

      }

    },

    120

  );

}


/* =====================================================
   팝업
===================================================== */

function openModal(html) {

  document
    .querySelector("#modalContent")
    .innerHTML = html;


  document
    .querySelector("#modal")
    .showModal();

}


document
  .querySelector("#closeModal")
  .onclick = () => {

    document
      .querySelector("#modal")
      .close();

  };


/* =====================================================
   새 게임 버튼
===================================================== */

document
  .querySelector("#newBtn")
  .onclick = () => {

    newGame();

  };


/* =====================================================
   다시 시작
===================================================== */

document
  .querySelector("#restartBtn")
  .onclick = () => {

    newGame(false);

  };


/* =====================================================
   레벨 선택
===================================================== */

document
  .querySelector("#levelBtn")
  .onclick = () => {

    let n =
      prompt(
        "레벨을 입력하세요 (1~5)",
        state.level
      );


    n =
      Number(n);


    if (
      n >= 1 &&
      n <= 5
    ) {

      state.level = n;

      newGame();

    }

  };


/* =====================================================
   소리
===================================================== */

document
  .querySelector("#soundBtn")
  .onclick = e => {

    state.sound =
      !state.sound;


    e.currentTarget.textContent =
      state.sound
        ? "🔊"
        : "🔇";

  };


/* =====================================================
   전체 화면
===================================================== */

document
  .querySelector("#fullBtn")
  .onclick = () => {

    document
      .documentElement
      .requestFullscreen?.();

  };


/* =====================================================
   도움말
===================================================== */

document
  .querySelector(
    '[data-action="help"]'
  )
  .onclick = () => {

    openModal(`

      같은 그림의 타일 2개를
      찾아 클릭하세요.

      <br><br>

      이 버전은 직관적인
      짝맞추기 방식으로 구성되어 있습니다.

      <br><br>

      화투 · 카드 · 과일 · 동물 · 캐릭터
      필터로 테마를 바꿀 수 있습니다.

    `);

  };


/* =====================================================
   순위
===================================================== */

document
  .querySelector(
    '[data-action="rank"]'
  )
  .onclick = () => {

    openModal(`

      현재 최고 기록:

      <br><br>

      <strong>
        ${localStorage.bestScore || 0}점
      </strong>

    `);

  };


/* =====================================================
   홈
===================================================== */

document
  .querySelector(
    '[data-action="home"]'
  )
  .onclick = () => {

    newGame();

  };


/* =====================================================
   테마 선택
===================================================== */

document
  .querySelectorAll(".chip")
  .forEach(

    button => {

      button.onclick = () => {

        document
          .querySelectorAll(".chip")
          .forEach(
            x =>
              x.classList.remove(
                "active"
              )
          );


        button.classList.add(
          "active"
        );


        state.theme =
          button.dataset.theme;


        newGame();

      };

    }

  );


/* =====================================================
   게임 시작
===================================================== */

newGame();
```
