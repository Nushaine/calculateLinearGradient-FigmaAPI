// GENERAL FUNCTIONS
export function round(num: number, decimalPlaces: number) {
  return parseFloat(num.toFixed(decimalPlaces))
}


export function RGBAObject2String(object: any, opacity: any) {
  return "rgba(" + String(round((object.r*255), 0)) + "," + String(round((object.g*255), 0)) + "," + String(round((object.b*255), 0)) + "," + String(round(opacity, 2)) + ")"
}


// LINEAR GRADIENT CALCULATION FUNCTIONS
export function calculateIntersection(p1: any, p2: any, p3: any, p4: any) {
    // usage: https://dirask.com/posts/JavaScript-how-to-calculate-intersection-point-of-two-lines-for-given-4-points-VjvnAj
	
    // down part of intersection point formula
    var d1 = (p1[0] - p2[0]) * (p3[1] - p4[1]); // (x1 - x2) * (y3 - y4)
    var d2 = (p1[1] - p2[1]) * (p3[0] - p4[0]); // (y1 - y2) * (x3 - x4)
    var d  = (d1) - (d2);

    if(d == 0) {
      throw new Error('Number of intersection points is zero or infinity.');
  }

    // upper part of intersection point formula
    var u1 = (p1[0] * p2[1] - p1[1] * p2[0]); // (x1 * y2 - y1 * x2)
    var u4 = (p3[0] * p4[1] - p3[1] * p4[0]); // (x3 * y4 - y3 * x4)
    
    var u2x = p3[0] - p4[0]; // (x3 - x4)
    var u3x = p1[0] - p2[0]; // (x1 - x2)
    var u2y = p3[1] - p4[1]; // (y3 - y4)
    var u3y = p1[1] - p2[1]; // (y1 - y2)

    // intersection point formula
    
    var px = (u1 * u2x - u3x * u4) / d;
    var py = (u1 * u2y - u3y * u4) / d;
    
    var p = { x: round(px, 2), y: round(py, 2) };

    return p;
}


export function rotate(cx: number, cy: number, x: number, y: number, angle: number) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}


export function rotateElipse(cx: number, cy: number, xRadius: number, yRadius: number, angle: number, rotationFactor: number){
    'https://www.desmos.com/calculator/aqlhivzbvs' // -> rotated elipse equations
    'https://www.mathopenref.com/coordparamellipse.html' // -> good explanation about elipse parametric equations
    'https://math.stackexchange.com/questions/941490/whats-the-parametric-equation-for-the-general-form-of-an-ellipse-rotated-by-any?noredirect=1&lq=1&newreg=fd8890e3dad245b0b6a0f182ba22f7f3' // -> good explanation of rotated parametric elipse equations
    // rotates points[x, y] some degrees about an origin [cx, cy]
    xRadius = xRadius * 1.5
    yRadius = yRadius * 1.5

    const normalizedRotationFactor = rotationFactor / 57.29577951  
    const cosAngle = Math.cos((Math.PI / 180) * (angle+180))
    const sinAngle = Math.sin((Math.PI / 180) * (angle+180))
    const x = ((-xRadius * Math.cos(normalizedRotationFactor) * cosAngle) - ( yRadius * Math.sin(normalizedRotationFactor) * sinAngle)) + cx
    const y = ((-yRadius * Math.cos(normalizedRotationFactor) * sinAngle) + (xRadius * Math.sin(normalizedRotationFactor) * cosAngle)) + cy    
    return [x, y]
}


export function getCorners(component: any, elemRotation: number) {
    // gets all 4 corners of a vector even if vector rotated
    const topLeft = [component.relativeTransform[0][2], component.relativeTransform[1][2]]
    const topRight = rotate(topLeft[0], topLeft[1], topLeft[0] + component.size.x, topLeft[1], -elemRotation)
    const bottomRight = rotate(topRight[0], topRight[1], topRight[0], topRight[1] + component.size.y, -elemRotation)
    const bottomLeft = rotate(bottomRight[0], bottomRight[1], bottomRight[0] - component.size.x, bottomRight[1], -elemRotation)
    return {'topLeft': topLeft, 'topRight': topRight, 'bottomLeft': bottomLeft, 'bottomRight': bottomRight}
}


export function calculateAngle(x1: number, y1: number, x2: number, y2: number) {
    let angle = Math.round(((180 / Math.PI) * Math.atan((y2-y1) / (x2-x1)))* 100) / 100

    const rounded = {
        "x1": Math.round(x1*100)/100, 
        "x2": Math.round(x2*100)/100, 
        "y1": Math.round(y1*100)/100, 
        "y2": Math.round(y2*100)/100
    }
    
    if(rounded.x1 < rounded.x2) {
        angle = angle + 180 // in quad 2 & 3
    } else if (rounded.x1 > rounded.x2) { 
        if(rounded.y1 < rounded.y2) {
            angle = 360 - Math.abs(angle) // in quad 4
        }
    } else if (rounded.x1 == rounded.x2) { // horizontal line
        if(rounded.y1 < rounded.y2) { 
            angle = 360 - Math.abs(angle) // on negative y-axis
        } else {
            angle = Math.abs(angle) // on positive y-axis
        }
    }
    return Math.round(angle * 100) / 100
}


export function getGradientPoints(topLeftCorner: any, pointRelativeCoords: any, shapeCenter:any, elemRotate: number) {
    const pointAbsoluteCoords = rotate(topLeftCorner[0], topLeftCorner[1], topLeftCorner[0] + pointRelativeCoords[0], topLeftCorner[1] + pointRelativeCoords[1], elemRotate)
    return pointAbsoluteCoords
}


export function createLinearGradient(fill: any, component: any) {
    //let temp = extractLinearGradientParamsFromTransform(component.absoluteBoundingBox.width, component.absoluteBoundingBox.height, fill.gradientTransform)
    let gradientAngle = calculateAngle(fill.gradientHandlePositions[2].x, fill.gradientHandlePositions[2].y, fill.gradientHandlePositions[0].x, fill.gradientHandlePositions[0].y)

    // this next section finds the linear gradient line segment -> https://stackoverflow.com/questions/51881307 creating-a-css-linear-gradient-based-on-two-points-relative-to-a-rectangle
    // calculating gradient line size (scalar) and change in x, y direction (coords)
    const lineChangeCoords = [
        (fill.gradientHandlePositions[1].x - fill.gradientHandlePositions[0].x) * component.size.x, 
        ((1 - fill.gradientHandlePositions[1].y) - (1 - fill.gradientHandlePositions[0].y)) * component.size.y
    ]
    const currentLineSize = Math.sqrt((lineChangeCoords[0] ** 2) + (lineChangeCoords[1] ** 2))

    // creating arbitrary gradient line 
    const desiredLength = ((component.size.x + component.size.y)/2)*4
    const scaleFactor = ((desiredLength-currentLineSize) / 2) / currentLineSize
    const scaleCoords = [lineChangeCoords[0] * scaleFactor, lineChangeCoords[1] * scaleFactor]

    const elemRotate = -Math.acos(component.relativeTransform[0][0]) * (180 / Math.PI)
    const corners = getCorners(component, elemRotate)

    const shapeCenter = calculateIntersection(corners.topLeft, corners.bottomRight, corners.topRight, corners.bottomLeft)

    const scaledArbGradientLine = [
        getGradientPoints(
            [corners.topLeft[0], corners.topLeft[1]], 
            [(fill.gradientHandlePositions[0].x * component.size.x) - scaleCoords[0], (fill.gradientHandlePositions[0].y * component.size.y) + scaleCoords[1]], 
            [shapeCenter.x, shapeCenter.y], 
            elemRotate
        ),
        getGradientPoints(
            [corners.topLeft[0], corners.topLeft[1]], 
            [(fill.gradientHandlePositions[1].x * component.size.x) + scaleCoords[0], (fill.gradientHandlePositions[1].y * component.size.y) - scaleCoords[1]], 
            [shapeCenter.x, shapeCenter.y], 
            elemRotate
        )
    ]
    
    // getting relevant corners     
    const centers = {
        "top": gradientAngle > 90 && gradientAngle <= 180 || gradientAngle > 270 && gradientAngle <= 360 ?  corners.topLeft : corners.topRight, 
        'bottom': gradientAngle >= 0 && gradientAngle <= 90 || gradientAngle > 180 && gradientAngle <=270 ? corners.bottomLeft : corners.bottomRight
    }

    // creating perpendicular lines
    const topLine = [
        rotate(centers.top[0], centers.top[1], centers.top[0] - (desiredLength / 2), centers.top[1], elemRotate),
        rotate(centers.top[0], centers.top[1], centers.top[0] + (desiredLength / 2), centers.top[1], elemRotate)
    ]
    const rotatedtopLine = [
        rotateElipse(centers.top[0], centers.top[1], centers.top[0]- topLine[0][0], (centers.top[0]- topLine[0][0]) * (component.size.y / component.size.x), gradientAngle, elemRotate),
        rotateElipse(centers.top[0], centers.top[1], centers.top[0]- topLine[1][0], (centers.top[0]- topLine[1][0]) * (component.size.y / component.size.x), gradientAngle, elemRotate),
    ]
    const bottomLine = [
        rotate(centers.bottom[0], centers.bottom[1], centers.bottom[0] - (desiredLength / 2), centers.bottom[1], elemRotate),
        rotate(centers.bottom[0], centers.bottom[1], centers.bottom[0] + (desiredLength / 2), centers.bottom[1], elemRotate)
    ]
    const rotatedbottomLine = [
        rotateElipse(centers.bottom[0], centers.bottom[1], centers.bottom[0]- bottomLine[0][0], (centers.bottom[0]- bottomLine[0][0]) * (component.size.y / component.size.x), gradientAngle, elemRotate),
        rotateElipse(centers.bottom[0], centers.bottom[1], centers.bottom[0]- bottomLine[1][0], (centers.bottom[0]- bottomLine[1][0]) * (component.size.y / component.size.x), gradientAngle, elemRotate),
    ]
    const perpLines = {"top": rotatedtopLine, "bottom": rotatedbottomLine}

    // calculating relevant portion of gradient line (the actual gradient line -> taking POI of perpendicular lines w/ arbitrary gradient line)
    const topLineIntersection = calculateIntersection(perpLines.top[0], perpLines.top[1], scaledArbGradientLine[0], scaledArbGradientLine[1])
    const bottomLineIntersection = calculateIntersection(perpLines.bottom[0], perpLines.bottom[1], scaledArbGradientLine[0], scaledArbGradientLine[1])

    const gradientLine = {"topCoords": topLineIntersection, "bottomCoords": bottomLineIntersection}
    const gradientLineDistance = Math.sqrt(((gradientLine.bottomCoords.y - gradientLine.topCoords.y) ** 2) + ((gradientLine.bottomCoords.x - gradientLine.topCoords.x) ** 2))

    const rounded = {
        "x1": Math.round(fill.gradientHandlePositions[0].x*100)/100, 
        "x2": Math.round(fill.gradientHandlePositions[1].x*100)/100, 
        "y1": Math.round(fill.gradientHandlePositions[0].y*100)/100, 
        "y2": Math.round(fill.gradientHandlePositions[1].y*100)/100
    }

    let absoluteStartingPoint = getGradientPoints(
        corners.topLeft, 
        [fill.gradientHandlePositions[0].x * component.size.x, fill.gradientHandlePositions[0].y * component.size.y], 
        [corners.topLeft[0] + (component.size.x / 2), corners.topLeft[1] + (component.size.y / 2)], 
        elemRotate
    )

    let colorStr = ``
    fill.gradientStops.map((color: any) => {
        // formatting rgb values into string
        let colorObj = {"r": color.color.r, "g":color.color.g, "b":color.color.b}
        let fillOpacity = fill.opacity == undefined ? 1 : fill.opacity
        let formattedColor = RGBAObject2String(colorObj, color.color.a * fillOpacity)

        let gradientStartPoint = {"x": 0, "y": 0}
        if(rounded.y1 < rounded.y2) {
            gradientStartPoint = gradientLine.topCoords.y < gradientLine.bottomCoords.y ? gradientLine.topCoords : gradientLine.bottomCoords
        } else {
            gradientStartPoint = gradientLine.topCoords.y > gradientLine.bottomCoords.y ? gradientLine.topCoords : gradientLine.bottomCoords 
            // HORIZONTAL OR VERTICAL LINES?????
        }
        
        let colorX = (color.position * lineChangeCoords[0]) + absoluteStartingPoint[0]
        let colorY = absoluteStartingPoint[1] - (color.position * lineChangeCoords[1])
        let colorDistance = Math.sqrt(((colorY - gradientStartPoint.y) ** 2) + ((colorX - gradientStartPoint.x) ** 2))
        let actualPercentage = colorDistance / gradientLineDistance

        colorStr += `${formattedColor} ${Math.round(actualPercentage * 10000) / 100}%, `
    })
    return ` linear-gradient(${gradientAngle}deg, ${colorStr}) `    
}
