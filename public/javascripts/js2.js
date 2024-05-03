function sortbylist() {
    document.getElementById("sortby").style.visibility = "visible";
}

function hidesortbylist() {
    document.getElementById("sortby").style.visibility = "hidden";
}

function close() {
    console.log("called");
    document.getElementById("staticBackdrop").style.display = "none";
}

function addproduct() {
    document.getElementById("staticBackdrop").style.display = "flex";
}

function updateproduct(event, product_id) {
    event.preventDefault()
    let form = document.getElementById('mainform');
    form.action = `/updateproduct/${product_id}`;
    form.submit();
}


function editbutton(product_id) {
    let form = document.getElementById("mainform");
    let input = form.querySelectorAll("input");
    input.forEach(input => {
        let selectinput = input.getAttribute('value') === product_id;
        if (selectinput) {
            input.closest('li').querySelectorAll("input, textarea, button").forEach(element =>
                element.disabled = false);

            input.closest('li').querySelector(".image img").style.display = "none";
            input.closest('li').querySelector(".image span input[type='file']").style.display = "block";
            input.closest('li').getElementById("imageinput").style.display = "block";
            document.getElementById("update").disabled = false;
        }
    });
}

function deleteproduct(product_id) {
    let form = document.getElementById("mainform");
    form.action = `/deleteproduct/${product_id}`;
    form.submit();
}

// js2.js

function addtocart(productid) {
    window.location.href = `/addtocart/${productid}`;
}

function cartpage() {
    isloggedIn();
}

function transactionpage(productid) {
    window.location.href = `/transactionpage/${productid}`;
}

function removefromcart(productid) {
    window.location.href = `/removefromcart/${productid}`;
}

function displaymodal(paymentmethod) {
    if (paymentmethod == 'cash')
        document.getElementById("cod_modal1").style.display = "flex";

    if (paymentmethod == 'bank')
        document.getElementById("cod_modal2").style.display = "flex";

    if (paymentmethod == 'upi')
        document.getElementById("cod_modal3").style.display = "flex";
}

function confirmorder(orderid, pymtmethod) {
    if (pymtmethod == 'Cash On Delivery') {
        var form = document.querySelector("#confirmorder1");
        form.action = `/confirmorder/${orderid}/${pymtmethod}`;
        form.submit();
    } else if (pymtmethod == 'Paid through bank') {
        var form = document.querySelector("#confirmorder2");
        form.action = `/confirmorder/${orderid}/${pymtmethod}`;
        form.submit();
    } else {
        var form = document.querySelector("#confirmorder3");
        form.action = `/confirmorder/${orderid}/${pymtmethod}`;
        form.submit();
    }

}

function cancelorder(order_id) {
    window.location.href = `/cancelorder/${order_id}`;
}