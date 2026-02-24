const result = JSON.parse(localStorage.getItem("lastResult"));

if (!result) {
    document.body.innerHTML = "<h3>لا توجد بيانات لعرض التقرير</h3>";
} else {
    document.getElementById("studentName").textContent = result.name;
    document.getElementById("studentGrade").textContent = result.grade;
    document.getElementById("studentClass").textContent = result.class;

    document.getElementById("score").textContent = result.score;
    document.getElementById("total").textContent = result.total;
    document.getElementById("percentage").textContent = result.percentage + "%";
    document.getElementById("time").textContent = result.time;
}
