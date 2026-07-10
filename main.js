
const addBtn = document.getElementById("addBtn");

const tableBody = document.getElementById("tableBody");

const searchBox = document.getElementById("searchBox");

const editIdInput = document.getElementById("editId");


const assetCodeInput = document.getElementById("assetCode");

const categoryInput = document.getElementById("category");

const subcategoryInput = document.getElementById("subcategory");

const assetTypeInput = document.getElementById("assetType");

const descriptionInput = document.getElementById("description");

const quantityInput = document.getElementById("quantity");

const statusInput = document.getElementById("status");

const custodianInput = document.getElementById("custodian");


// ------------------------------------------

// Load all assets as soon as the page opens

// ------------------------------------------

window.onload = function () {

    loadAssets();

};


// ------------------------------------------

// Fetch all assets from the server and display them

// ------------------------------------------

function loadAssets() {

    fetch("/assets")

        .then((res) => res.json())

        .then((data) => {

            renderTable(data);

        })

        .catch((err) => {

            console.log("Error loading assets:", err);

            alert("Failed to load assets. Please make sure the server is running.");

        });

}


// ------------------------------------------

// Build the table rows from an array of asset objects

// ------------------------------------------

function renderTable(assets) {

    tableBody.innerHTML = ""; // clear old rows first


    assets.forEach(function (asset) {

        const row = document.createElement("tr");


        row.innerHTML = `

            <td>${asset.id}</td>

            <td>${asset.asset_code}</td>

            <td>${asset.category}</td>

            <td>${asset.subcategory}</td>

            <td>${asset.asset_type}</td>

            <td>${asset.description}</td>

            <td>${asset.quantity}</td>

            <td>${asset.status}</td>

            <td>${asset.custodian}</td>

            <td>

                <button class="edit" onclick="editAsset(${asset.id})">Edit</button>

                <button class="delete" onclick="deleteAsset(${asset.id})">Delete</button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


// ------------------------------------------

// Validate the form fields.

// Returns an object with the form data if everything is valid,

// or null (and shows an alert) if something is wrong.

// ------------------------------------------

function validateForm() {

    const assetCode = assetCodeInput.value.trim();

    const category = categoryInput.value;

    const subcategory = subcategoryInput.value.trim();

    const assetType = assetTypeInput.value;

    const description = descriptionInput.value.trim();

    const quantity = quantityInput.value.trim();

    const status = statusInput.value;

    const custodian = custodianInput.value.trim();


    if (!assetCode) {

        alert("Asset Code cannot be empty");

        return null;

    }

    if (category === "Select Category") {

        alert("Please select a Category");

        return null;

    }

    if (assetType === "Select Asset Type") {

        alert("Please select an Asset Type");

        return null;

    }

    if (!description) {

        alert("Description cannot be empty");

        return null;

    }

    if (quantity === "") {

        alert("Quantity cannot be empty");

        return null;

    }

    // /^\d+$/ only matches whole numbers (no minus sign, no decimal point)

    if (!/^\d+$/.test(quantity)) {

        alert("Quantity must be a whole positive number (no decimals or negative numbers)");

        return null;

    }

    if (parseInt(quantity) <= 0) {

        alert("Quantity must be greater than 0");

        return null;

    }

    if (status === "Select Status") {

        alert("Please select a Status");

        return null;

    }

    if (!custodian) {

        alert("Custodian cannot be empty");

        return null;

    }


    return {

        asset_code: assetCode,

        category: category,

        subcategory: subcategory,

        asset_type: assetType,

        description: description,

        quantity: parseInt(quantity),

        status: status,

        custodian: custodian,

    };

}


// ------------------------------------------

// Add / Update button click

// If editIdInput has a value, we are updating. Otherwise, adding new.

// ------------------------------------------

addBtn.addEventListener("click", function () {

    const formData = validateForm();

    if (!formData) return; // validation failed, stop here


    const editId = editIdInput.value;


    if (editId) {

        // ---- UPDATE MODE ----

        fetch("/assets/" + editId, {

            method: "PUT",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify(formData),

        })

            .then((res) => res.json())

            .then((data) => {

                if (data.error) {

                    alert(data.error);

                    return;

                }

                alert("Asset updated successfully");

                resetForm();

                loadAssets();

            })

            .catch((err) => {

                console.log("Error updating asset:", err);

                alert("Something went wrong while updating the asset");

            });

    } else {

        // ---- ADD MODE ----

        fetch("/assets", {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify(formData),

        })

            .then((res) => res.json())

            .then((data) => {

                if (data.error) {

                    alert(data.error);

                    return;

                }

                alert("Asset added successfully");

                resetForm();

                loadAssets();

            })

            .catch((err) => {

                console.log("Error adding asset:", err);

                alert("Something went wrong while adding the asset");

            });

    }

});


// ------------------------------------------

// Clear the form back to its default state

// ------------------------------------------

function resetForm() {

    assetCodeInput.value = "";

    categoryInput.value = "Select Category";

    subcategoryInput.value = "";

    assetTypeInput.value = "Select Asset Type";

    descriptionInput.value = "";

    quantityInput.value = "";

    statusInput.value = "Select Status";

    custodianInput.value = "";

    editIdInput.value = "";

    addBtn.textContent = "Add Asset";

}


// ------------------------------------------

// Load one asset's data into the form for editing

// ------------------------------------------

function editAsset(id) {

    fetch("/assets")

        .then((res) => res.json())

        .then((assets) => {

            const asset = assets.find((a) => a.id === id);

            if (!asset) {

                alert("Asset not found");

                return;

            }


            assetCodeInput.value = asset.asset_code;

            categoryInput.value = asset.category;

            subcategoryInput.value = asset.subcategory;

            assetTypeInput.value = asset.asset_type;

            descriptionInput.value = asset.description;

            quantityInput.value = asset.quantity;

            statusInput.value = asset.status;

            custodianInput.value = asset.custodian;

            editIdInput.value = asset.id;


            addBtn.textContent = "Update"; // change button text

            window.scrollTo(0, 0); // scroll up so user sees the form

        })

        .catch((err) => {

            console.log("Error loading asset for edit:", err);

            alert("Failed to load asset details");

        });

}


// ------------------------------------------

// Delete an asset after confirmation

// ------------------------------------------

function deleteAsset(id) {

    const confirmDelete = confirm("Are you sure you want to delete this asset?");

    if (!confirmDelete) return;


    fetch("/assets/" + id, { method: "DELETE" })

        .then((res) => res.json())

        .then((data) => {

            if (data.error) {

                alert(data.error);

                return;

            }

            loadAssets(); // refresh table after deleting

        })

        .catch((err) => {

            console.log("Error deleting asset:", err);

            alert("Something went wrong while deleting the asset");

        });

}


// ------------------------------------------

// Live search: fires every time the user types in the search box

// ------------------------------------------

searchBox.addEventListener("input", function () {

    const query = searchBox.value.trim();


    if (query === "") {

        loadAssets(); // if search box is empty, show everything again

        return;

    }


    fetch("/assets/search?q=" + encodeURIComponent(query))

        .then((res) => res.json())

        .then((data) => {

            renderTable(data);

        })

        .catch((err) => {

            console.log("Error searching assets:", err);

        });

});