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
 * @param {Object} v - vehicle row from DB
 * @returns {string} HTML
 */
function buildVehicleDetailHTML(v) {
  const price = formatPrice(v.inv_price)
  const mileage = formatMileage(v.inv_miles)
  const imageUrl = v.inv_image || '/images/vehicles/default-vehicle.png'

  return `
    <article class="vehicle-detail__card" aria-labelledby="vehicle-title">
      <figure class="vehicle-detail__media">
        <img src="${imageUrl}" alt="${v.inv_make} ${v.inv_model}" loading="lazy" />
        <figcaption>Image of ${v.inv_make} ${v.inv_model}</figcaption>
      </figure>

      <section class="vehicle-detail__info">
        <h2 id="vehicle-title">${v.inv_make} ${v.inv_model} — ${v.inv_year}</h2>
        <p class="vehicle-detail__price">Price: <strong>${price}</strong></p>
        <p class="vehicle-detail__miles">Mileage: ${mileage}</p>

        <dl class="vehicle-detail__specs">
          <dt>Make</dt><dd>${v.inv_make}</dd>
          <dt>Model</dt><dd>${v.inv_model}</dd>
          <dt>Year</dt><dd>${v.inv_year}</dd>
          <dt>Color</dt><dd>${v.inv_color || 'Not specified'}</dd>
          <dt>Body</dt><dd>${v.inv_body || 'Not specified'}</dd>
          <dt>VIN</dt><dd>${v.inv_vin || 'N/A'}</dd>
        </dl>

        <div class="vehicle-detail__desc">
          <h3>Description</h3>
          <p>${v.inv_description || 'No description available.'}</p>
        </div>
      </section>
    </article>
  `
}

module.exports = {
  buildVehicleDetailHTML,
}
