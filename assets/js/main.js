// Year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Optional: protect against forgetting Smartstore URL
document.querySelectorAll('a[href="SMARTSTORE_URL"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    alert("SMARTSTORE_URL을 실제 네이버 스마트스토어 링크로 교체해 주세요.");
  });
});
