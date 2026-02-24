let student = null;
let questions = [];
let randomizedQuestions = [];

// تسجيل الدخول
// تسجيل الدخول
async function login() {
    const id = document.getElementById("studentId").value.trim();

    // 1) دخول المعلم أولاً
    if (id === "teacher2026") {
        window.location.href = "report.html";
        return;
    }

    // 2) تحميل بيانات الطلاب من JSON
    const students = await fetch("students-data.json").then(r => r.json());
    student = students.find(s => s.id === id);

    if (!student) {
        alert("رقم السجل المدني غير صحيح");
        return;
    }

    // 3) التحقق هل الطالب حل الاختبار مسبقًا من Firebase
    firebase.database().ref("month/" + id).once("value", snapshot => {
        if (snapshot.exists()) {
            alert("لقد قمت بحل الاختبار مسبقًا ولا يمكنك الدخول مرة أخرى");
            return;
        }

        // 4) دخول الطالب لأول مرة فقط
        document.getElementById("sName").textContent = student.name;
        document.getElementById("sGrade").textContent = student.grade;
        document.getElementById("sClass").textContent = student.class;

        document.getElementById("loginSection").style.display = "none";
        document.getElementById("examSection").style.display = "block";

        loadQuestions();
    });
}


// تحميل الأسئلة
async function loadQuestions() {
    const data = await fetch("questions-data.json").then(r => r.json());

    // لأن ملفك عبارة عن مصفوفة فيها عنصر واحد
    questions = data[0].questions;

    randomizedQuestions = shuffleArray(questions);

    displayQuestions();
}

// خلط الأسئلة
function shuffleArray(array) {
    return array
        .map(a => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map(a => a.value);
}

// عرض الأسئلة
function displayQuestions() {
    const container = document.getElementById("questionsContainer");
    container.innerHTML = "";

    randomizedQuestions.forEach((q, index) => {
        const div = document.createElement("div");
        div.className = "question";

        div.innerHTML = `
            <h4>${index + 1}) ${q.q}</h4>

            <label><input type="radio" name="q${index}" value="0"> ${q.a}</label><br>
            <label><input type="radio" name="q${index}" value="1"> ${q.b}</label><br>
            ${q.c ? `<label><input type="radio" name="q${index}" value="2"> ${q.c}</label><br>` : ""}
            ${q.d ? `<label><input type="radio" name="q${index}" value="3"> ${q.d}</label><br>` : ""}
        `;

        container.appendChild(div);
    });
}

// إرسال الاختبار
function submitExam() {

    // التحقق من أن كل الأسئلة مجاب عليها
    for (let i = 0; i < randomizedQuestions.length; i++) {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (!selected) {
            alert("الرجاء الإجابة على جميع الأسئلة قبل الإرسال");
            return; // إيقاف الإرسال
        }
    }

    let correctCount = 0;

    randomizedQuestions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        const studentAnswer = selected ? parseInt(selected.value) : null;

        if (studentAnswer === q.correct) correctCount++;
    });

    const result = {
        studentId: student.id,
        name: student.name,
        grade: student.grade,
        class: student.class,
        score: correctCount,
        total: randomizedQuestions.length,
        percentage: Math.round((correctCount / randomizedQuestions.length) * 100),
        time: new Date().toLocaleString()
    };

    // تخزين في Firebase داخل /month/studentId
    firebase.database().ref("month/" + student.id).set(result)
        .then(() => {
            alert("تم إرسال الإجابات بنجاح");
            window.location.href = "index.html"; // الرجوع لصفحة الدخول
        })
        .catch((error) => {
            alert("خطأ أثناء حفظ البيانات: " + error);
        });
}
