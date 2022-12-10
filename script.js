//используемые элементы DOM и константы
const $section = document.querySelector("[data-section]");
const $button = document.querySelector("[data-set]");
const $openAddCat = document.querySelector("[data-openAddCat]");
const $closeAddCat = document.querySelector("[data-closeAddCat]");
const $selectedCat = document.querySelector("[data-selectedCat]");
const $closeSelectedCat = document.querySelector("[data-closeSelectedCat]");
const $editCat = document.querySelector("[data-editCat]");
const $data_id = document.querySelector("[data-id]");
const $data_name = document.querySelector("[data-name]");
const $data_rate = document.querySelector("[data-rate]");
const $data_img = document.querySelector("[data-img]");
const $data_descr = document.querySelector("[data-descr]");
const $confirmation = document.querySelector("[data-confirmation]");
const $delCat = document.querySelector("[data-delCat]");
const $noDelCat = document.querySelector("[data-noDelCat]");
const path = "https://srv.petiteweb.dev/api/2/l0rTr0l/";
let selectedСard;

//функция, возвращающая карточку котеев
function generateCard(data){
    return `<div data-card="${data.id}" class="card">
                <div class="id">
                    <h3>${data.id}</h3>
                </div>
                <img src="${data.img_link}" alt="Здесь должен быть котей">
                <div class="info">
                    <h3 class="name">Порода: <span class="name__breed">${data.name}</span></h3>
                    <div data-rateCard class="rate">${data.rate}</div>
                    <i data-action="delete" class="delete fa-solid fa-trash-can" title="Удалить кота"></i>
                </div>
                <div class="none">
                    <p>${data.id}</p>
                    <p>${data.name}</p>
                    <p>${data.rate}</p>
                    <p>${data.img_link}</p>
                    <p>${data.description}</p>
                </div>
            </div>`
}

//функция вывода карточек котеев
function showCat(){
    fetch(path+"show")
        .then(response => {
            return response.json();
        })
        .then(data => {
            let arr = data.data;
            arr.sort((a,b) => a.id-b.id);
            for(let i = 0; i < arr.length; i++){
                $section.innerHTML += generateCard(arr[i]);
            }
            let globRate = document.querySelectorAll("[data-rateCard]");
            globRate.forEach((el) => {
                let rate = el.innerText;
                el.innerText = "";
                generateStar(el, rate);
            })
        })
        .catch(error =>{
            throw new Error(error);
        })
}
showCat();

//функция отрисовки рейтинга
function generateStar(place, rate){
    let num = 0;
    for(let i = 0; i < 10; i++){
        let rateNum = document.createElement("i");
        rateNum.classList.add("fa-solid","fa-paw");
        if(num < rate){
            rateNum.classList.add("orange");
        }
        place.appendChild(rateNum);
        num++;
    }
}

//вывод запроса на подтверждение удаления кота либо открытие карточки
$section.addEventListener("click", event => {
    if(event.target.dataset.action === "delete"){
        selectedСard = event.target.closest("[data-card]");
        $confirmation.classList.add("visible");
        $delCat.addEventListener("click",funDelCat);
        $noDelCat.addEventListener("click",remClassVis);
    }else if(event.target.closest("[data-card]") && event.target.dataset.action !== "delete"){
        $data_rate.innerHTML = "";
        let card = event.target.closest("[data-card]");
        let id = card.lastElementChild.firstElementChild.innerText;
        let name = card.lastElementChild.firstElementChild.nextElementSibling.innerText;
        let rate = card.lastElementChild.firstElementChild.nextElementSibling.nextElementSibling.innerText;
        let img_link = card.lastElementChild.lastElementChild.previousElementSibling.innerText;
        let description = card.lastElementChild.lastElementChild.innerText;
        $data_id.innerText = id;
        $data_name.innerText = name;
        $data_rate.innerText = rate;
        generateStar($data_rate, rate);
        $data_descr.innerText = description;
        $data_img.setAttribute("src",img_link);
        $selectedCat.classList.add("translate");
    }
})

//функция закрытия попапа подтверждения удаления
function remClassVis(){
    $confirmation.classList.remove("visible");
    $delCat.removeEventListener("click",funDelCat);
    $noDelCat.removeEventListener("click",remClassVis);
}

//функция удаления котеев (со страницы и сервера)
function funDelCat(){
    fetch(`${path}delete/${selectedСard.dataset.card}`,{method: "delete"})
    .catch(error =>{
        throw new Error(error);
    })
    selectedСard.remove();
    remClassVis();
}

//закрытие карточки
$closeSelectedCat.addEventListener("click", () => {
    if(document.querySelectorAll(".remove").length !== 0){
        listenerCancel();
    }
    $data_id.innerText = "";
    $data_name.innerText = "";
    $data_descr.innerText = "";
    $data_img.removeAttribute("src");
    $selectedCat.classList.remove("translate");
})

//открытие формы новых котеев
$button.addEventListener("click", () => {
    $openAddCat.classList.add("visible");
})

//закрытие формы новых котеев
$closeAddCat.addEventListener("click", () => {
    $openAddCat.classList.remove("visible");
})

//подбор незанятого id и создание новых котеев на странице и сервере
document.forms.addCat.addEventListener("submit", (event) => {
    event.preventDefault();
    let numId = 0;
    fetch(path+"ids")
        .then(response => {
            return response.json();
        })
        .then(resData => {
            let arr = resData.data;
            let num = 1;
            arr.sort((a,b) => a-b);
            for(let i = 0; i < (arr.length + 1); i++){
                if(arr[i] !== num){
                    numId = num;
                    break;
                }
                num++;
            }
            let data = Object.fromEntries(new FormData(event.target).entries());
            let newData = {
                "id": numId,
                "name": data.name,
                "rate": data.rate,
                "description": data.description,
                "img_link": data.img_link
            };
            fetch(path+"add",{
                method: "post",
                headers: {"Content-type":"application/json"},
                body: JSON.stringify(newData)
            })
            .then(() =>{
                $openAddCat.classList.remove("visible");
                fetch(`${path}show/${numId}`)
                    .then(response => {
                        return response.json();
                    })
                    .then(data => {
                        $section.insertAdjacentHTML("beforeend", generateCard(data.data));
                        let globRate = document.querySelectorAll("[data-rateCard]");
                        let newElem = globRate[globRate.length - 1];
                        let newRate = newElem.innerText;
                        newElem.innerText = "";
                        generateStar(newElem, newRate);
                        $section.scrollIntoView(false);
                    })
                    .catch(error =>{
                        throw new Error(error);
                    })
            })
            .catch(error =>{
                throw new Error(error);
            })
        })
        .catch(error =>{
            throw new Error(error);
        })
})

//запись формы в localStorage и автозаполнение формы
document.forms.addCat.addEventListener('input', () => {
	let data = Object.fromEntries(new FormData(document.forms.addCat).entries());
	localStorage.setItem(document.forms.addCat.name, JSON.stringify(data));
})
let dataFromLS = localStorage.getItem(document.forms.addCat.name);
let formDataFromLS = dataFromLS ? JSON.parse(dataFromLS) : undefined;
if (formDataFromLS) {
	Object.keys(formDataFromLS).forEach(key => {
		document.forms.addCat[key].value = formDataFromLS[key];
	})
}

//открытие редактора содержимого карточки котея
$editCat.addEventListener("click", () => {
    let img = document.createElement("input");
    let img_h3 = document.createElement("h3");
    img.value = $data_img.getAttribute("src");
    img.style = "width:700px";
    img.classList.add("editData","remove");
    img_h3.innerText = "Ссылка на картинку:";
    img_h3.classList.add("h3","name__breed");
    img_h3.classList.add("remove");
    $data_img.after(img);
    $data_img.after(img_h3);
    $data_img.classList.add("none");

    let name = document.createElement("input");
    name.value = $data_name.innerText;
    name.style = "width:450px";
    name.classList.add("editData","remove");
    $data_name.after(name);
    $data_name.parentElement.classList.add("name__breed");
    $data_name.classList.add("none");

    let descr = document.createElement("textarea");
    let descr_h3 = document.createElement("h3");
    descr.value = $data_descr.innerText;
    descr.style = "width:700px; height:500px";
    descr.classList.add("editData","remove");
    descr_h3.innerText = "Описание:";
    descr_h3.classList.add("h3","name__breed");
    descr_h3.classList.add("remove");
    $data_descr.after(descr);
    $data_descr.after(descr_h3);
    $data_descr.classList.add("none");

    let rate = document.createElement("input");
    let rate_h3 = document.createElement("h3");
    rate.value = $data_rate.innerText;
    rate.style = "width:300px";
    rate.classList.add("editData","remove");
    rate.setAttribute("type","number");
    rate.setAttribute("max","10");
    rate_h3.innerText = "Рейтинг:";
    rate_h3.classList.add("h3","name__breed");
    rate_h3.classList.add("remove");
    $data_rate.after(rate);
    $data_rate.after(rate_h3);
    $data_rate.classList.add("none");

    $editCat.parentElement.insertAdjacentHTML("beforeend",'<button data-submitEditCat type="submit"><i class="fa-solid fa-check"></i></button><button data-cancelEditCat type="button"><i class="fa-solid fa-xmark"></i></button>');
    let $submitEditCat = document.querySelector("[data-submitEditCat]");
    let $cancelEditCat = document.querySelector("[data-cancelEditCat]");
    $submitEditCat.setAttribute("style","color:green");
    $cancelEditCat.setAttribute("style","color:red");
    $editCat.classList.add("none");
    $submitEditCat.addEventListener("click",listenerSubmit);
    $cancelEditCat.addEventListener("click",listenerCancel);
})

//функция отправки редактированного котея на сервер и изменения данных карточки
const listenerSubmit = (event) =>{
    event.preventDefault();
    let editData = document.querySelectorAll(".editData");
    let numCard = $data_id.innerText;
    let newData = {
        "name": editData[1].value,
        "rate": +editData[3].value,
        "description": editData[2].value,
        "img_link": editData[0].value
    };
    fetch(`${path}update/${numCard}`,{
        method: "put",
        headers: {"Content-type":"application/json"},
        body: JSON.stringify(newData)
    })
    .then(() =>{
        $section.innerHTML = "";
        showCat();
    })
    .catch(error =>{
        throw new Error(error);
    })
    $data_rate.innerHTML = "";
    $data_img.setAttribute("src",editData[0].value);
    $data_name.innerText = editData[1].value;
    $data_descr.innerText = editData[2].value;
    $data_rate.innerText = +editData[3].value;
    generateStar($data_rate, +editData[3].value);
    listenerCancel();
}

//функция закрытия редактора содержимого карточки котея
const listenerCancel = () => {
    let arr = document.querySelectorAll(".remove");
    arr.forEach((el)=>{
        el.remove();
    })
    document.querySelector("[data-submitEditCat]").remove();
    document.querySelector("[data-cancelEditCat]").remove();
    $data_img.classList.remove("none");
    $data_name.parentElement.classList.remove("name__breed");
    $data_name.classList.remove("none");
    $data_rate.classList.remove("none");
    $data_descr.classList.remove("none");
    $editCat.classList.remove("none");
}