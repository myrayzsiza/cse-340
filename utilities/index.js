const invModel = require("../models/inventory-model")
const { checkLogin } = require("../middleware/auth")

// Simple image path fixer - ensure paths include /vehicles/
function getImagePath(imagePath) {
  if (!imagePath) return "/images/vehicles/no-image.png"
  
  // Convert to string and trim
  let path = String(imagePath).trim()
  
  // Already correct - has /images/vehicles/
  if (path.includes("/images/vehicles/")) {
    return path.startsWith("/") ? path : "/" + path
  }
  
  // Has /images/ but missing /vehicles/ - add it
  if (path.includes("/images/")) {
    return path.replace("/images/", "/images/vehicles/")
  }
  
  // Just a filename - add full path
  return `/images/vehicles/${path}`
}

function formatPrice(value) {
  const num = Number(value) || 0
  return num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
}

function formatMileage(value) {
  const num = Number(value) || 0
  return `${num.toLocaleString("en-US")} miles`
}

function buildVehicleDetailHTML(v) {
  const title = `${v.inv_make} ${v.inv_model}`
  const price = formatPrice(v.inv_price)
  const mileage = formatMileage(v.inv_miles)
  const imageUrl = getImagePath(v.inv_image)

  const html = `
    <article class="vehicle-detail__card" aria-labelledby="vehicle-title">
      <figure class="vehicle-detail__media">
        <img src="${imageUrl}" alt="${v.inv_make} ${v.inv_model} full-size image" loading="lazy" />
        <figcaption>Full-size image of ${v.inv_make} ${v.inv_model}</figcaption>
      </figure>
      <section class="vehicle-detail__info">
        <h2 id="vehicle-title">${v.inv_make} ${v.inv_model} — ${v.inv_year}</h2>
        <p class="vehicle-detail__price">Price: <strong>${price}</strong></p>
        <p class="vehicle-detail__miles">Mileage: ${mileage}</p>
        <dl class="vehicle-detail__specs">
          <dt>Make</dt><dd>${v.inv_make}</dd>
          <dt>Model</dt><dd>${v.inv_model}</dd>
          <dt>Year</dt><dd>${v.inv_year}</dd>
          <dt>MPG</dt><dd>${v.inv_mpg || "N/A"}</dd>
          <dt>Color</dt><dd>${v.inv_color || "Not specified"}</dd>
          <dt>Fuel Type</dt><dd>${v.inv_fuel || "N/A"}</dd>
          <dt>Drivetrain</dt><dd>${v.inv_drivetrain || "N/A"}</dd>
          <dt>Transmission</dt><dd>${v.inv_transmission || "N/A"}</dd>
          <dt>VIN</dt><dd>${v.inv_vin || "N/A"}</dd>
          <dt>Stock #</dt><dd>${v.inv_stock || "N/A"}</dd>
        </dl>
        <div class="vehicle-detail__desc">
          <h3>Description</h3>
          <p>${v.inv_description || "No description available."}</p>
          <p class="vehicle-detail__inspection">This vehicle has passed inspection by an ASE-certified technician.</p>
        </div>
      </section>
    </article>
  `
  return { title, html }
}

async function buildClassificationList(classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList = '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

const Util = {}

Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list += '<a href="/inv/type/' + row.classification_id + '" title="See our inventory of ' + row.classification_name + ' vehicles">' + row.classification_name + "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

Util.buildClassificationGrid = async function (data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      grid += '<li>'
      let thumb = getImagePath(vehicle.inv_thumbnail)
      grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details"><img src="${thumb}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" loading="lazy" /></a>`
      grid += '<div class="namePrice">'
      grid += "<hr />"
      grid += "<h2>"
      grid += '<a href="/inv/detail/' + vehicle.inv_id + '" title="View ' + vehicle.inv_make + " " + vehicle.inv_model + ' details">' + vehicle.inv_make + " " + vehicle.inv_model + "</a>"
      grid += "</h2>"
      grid += "<span>$" + new Intl.NumberFormat("en-US").format(vehicle.inv_price) + "</span>"
      grid += `<button class="order-btn" data-vehicle-id="${vehicle.inv_id}" data-vehicle-name="${vehicle.inv_make} ${vehicle.inv_model}">Order Now</button>`
      grid += "</div>"
      grid += "</li>"
    })
    grid += "</ul>"
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


Util.buildSingleVehicleDisplay = async (vehicle, accountData = null) => {
  if (!vehicle) return '<div>Vehicle not found.</div>';
  const price = Number(vehicle.inv_price).toLocaleString("en-US", { style: "currency", currency: "USD" });
  const miles = Number(vehicle.inv_miles).toLocaleString("en-US");
  const imageUrl = getImagePath(vehicle.inv_image);
  
  // Build order button based on login status
  let orderButton = '';
  if (accountData && accountData.account_id) {
    orderButton = `<a href="/order/checkout/${vehicle.inv_id}" class="order-btn">Order Now</a>`;
  } else {
    orderButton = `<a href="/account/login" class="order-btn">Login to Order</a>`;
  }
  
  return `
    <div class="vehicle-detail-container">
      <div class="vehicle-image">
        <img src="${imageUrl}" alt="${vehicle.inv_make} ${vehicle.inv_model}" loading="lazy" />
      </div>
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Mileage:</strong> ${miles} miles</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <div class="vehicle-actions">
          ${orderButton}
        </div>
      </div>
    </div>
    <style>
      .vehicle-detail-container {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        margin: 2rem 0;
      }
      .vehicle-image {
        flex: 1 1 300px;
        min-width: 250px;
        max-width: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .vehicle-image img {
        width: 100%;
        max-width: 400px;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .vehicle-info {
        flex: 2 1 300px;
        min-width: 250px;
      }
      .vehicle-actions {
        margin-top: 1.5rem;
      }
      .order-btn {
        display: inline-block;
        background-color: #007bff;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        text-decoration: none;
        font-weight: bold;
        transition: background-color 0.3s ease;
      }
      .order-btn:hover {
        background-color: #0056b3;
      }
      @media (max-width: 700px) {
        .vehicle-detail-container {
          flex-direction: column;
          align-items: stretch;
        }
        .vehicle-image, .vehicle-info {
          max-width: 100%;
        }
      }
    </style>
  `;
};

Util.handleErrors = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = {
  getImagePath,
  buildVehicleDetailHTML,
  buildClassificationList,
  checkLogin,
  ...Util
}
