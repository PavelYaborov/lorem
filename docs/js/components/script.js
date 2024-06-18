let planetBtn = document.querySelector(".abc")

planetBtn.addEventListener('click', () => {
  if (planetBtn.textContent === 'RU') {
    planetBtn.textContent = 'ENG'
  } else if (planetBtn.textContent === 'ENG') {
    planetBtn.textContent = 'RU'
  }
})
