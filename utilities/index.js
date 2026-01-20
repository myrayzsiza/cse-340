function formatPrice(value) {
  const num = Number(value) || 0
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function formatMileage(value) {
  const num = Number(value) || 0
  return `${num.toLocaleString('en-US')} miles`
}

/**
 * Build a semantic, accessible HTML string for a vehicle detail
 * Returns an object with `title` and `html` so controller can set <title> and the view can render safely
 * @param {Object} v - vehicle row from DB
 * @returns {{title:string, html:string}}
 */
function buildVehicleDetailHTML(v) {
  const title = `${v.inv_make} ${v.inv_model}`
  const price = formatPrice(v.inv_price)
  const mileage = formatMileage(v.inv_miles)
  const imageUrl = v.inv_image || '/images/vehicles/default-vehicle.png'

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
          <dt>MPG</dt><dd>${v.inv_mpg || 'N/A'}</dd>
          <dt>Color</dt><dd>${v.inv_color || 'Not specified'}</dd>
          <dt>Fuel Type</dt><dd>${v.inv_fuel || 'N/A'}</dd>
          <dt>Drivetrain</dt><dd>${v.inv_drivetrain || 'N/A'}</dd>
          <dt>Transmission</dt><dd>${v.inv_transmission || 'N/A'}</dd>
          <dt>VIN</dt><dd>${v.inv_vin || 'N/A'}</dd>
          <dt>Stock #</dt><dd>${v.inv_stock || 'N/A'}</dd>
        </dl>

        <div class="vehicle-detail__desc">
          <h3>Description</h3>
          <p>${v.inv_description || 'No description available.'}</p>
          <p class="vehicle-detail__inspection">This vehicle has passed inspection by an ASE-certified technician.</p>
        </div>
      </section>
    </article>
  `

  return { title, html }
}

module.exports = {
  buildVehicleDetailHTML,
}
