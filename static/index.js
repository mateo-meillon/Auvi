const url = window.location.href
// Get The Query params that u need - for example: ?id=1 - gives for id 1
const getQueryParams = ( params ) => {
  const href = url
  // this is an expression to get query strings
  let regexp = new RegExp( '[?&]' + params + '=([^&#]*)', 'i' )
  let qString = regexp.exec(href)
  return qString ? qString[1] : null
}

const color_layer_one = getQueryParams('ca') // Get the color for the first layer
const color_layer_two = getQueryParams('cb') // Get the color for the second layer
const rotation = getQueryParams('ro') // Rotation of the circles

const cone = document.getElementById('cone')
const ctwo = document.getElementById('ctwo')

const circle = getQueryParams('co')
const wich = getQueryParams('wi')

if (circle == 'nein') {
    if (wich == 'true')
        cone.style.opacity = "0"
    else
        ctwo.style.opacity = "0"
}

const oneDir = document.getElementById('oneDir')
const secDir = document.getElementById('secDir')

// Set the rotation of the circles
oneDir.style.transform = `rotate(${rotation}deg)`
secDir.style.transform = `rotate(-${rotation}deg)`

let index = 0
let bool = true
async function createCircle() {
    // Get coords
    const response = await fetch('../api/coords')
    const data = await response.json()
    // ForEach coords
    data.forEach((coord) => {
        let obj = document.createElement("div")
        obj.classList.add("box")
        console.log(coord)
        obj.style.left = coord.x + '%'
        obj.style.top = coord.y + '%'
        obj.style.backgroundColor = "#" + (bool ? color_layer_one : color_layer_two)
        obj.style.transform = bool ? `rotate(-${rotation}deg)` : `rotate(${rotation}deg)`
        if (bool)
            oneDir.appendChild(obj)
        else
            secDir.appendChild(obj)
        index++
        bool = !bool
    })
    const finished = document.createElement("div")
    finished.id = "finished"
    finished.style.display = "none"
    finished.innerHTML = `${window.location.href}`
    document.body.appendChild(finished)
}
createCircle()