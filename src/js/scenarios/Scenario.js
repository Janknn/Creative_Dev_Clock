import Scene from "../canvas/Scene"

const drawLine = (context, x, y, length, angle, color, lineWidth) => {
    context.save()
    context.beginPath()

    // offset + rotate
    context.translate(x, y)
    context.rotate(angle) // ! radian

    // draw line
    context.moveTo(-length / 2, 0)
    context.lineTo(length / 2, 0)
    context.strokeStyle = color
    context.lineWidth = lineWidth
    context.stroke()

    context.closePath()
    context.restore()
}

export default class Scenario extends Scene {
    constructor(id) {
        super(id)

        // Couleurs pour les heures, minutes, et secondes
        this.params.hourColor = "#ff0000"; // Rouge pour les heures
        this.params.minuteColor = "#00ff00"; // Vert pour les minutes
        this.params.secondColor = "#0000ff"; // Bleu pour les secondes

        // debug
        this.params['line-width'] = 2
        this.params.speed = 1
        this.params.color = "#ffffff"
        if (this.debug.active) {
            this.debugFolder.add(this.params, 'line-width', 1, 10).onChange(() => this.drawUpdate())
            this.debugFolder.add(this.params, 'speed', -2, 2, .25)
            this.debugFolder.addColor(this.params, 'color')
        }
    }

    resize() {
        super.resize()

        // main dimensions
        this.mainRadius = this.width < this.height ? this.width : this.height
        this.mainRadius *= .5
        this.mainRadius *= .65
        this.deltaRadius = this.mainRadius * .075

        // shapes update
        if (!!this.arcs) {
            this.arcs.forEach((e, index) => {
                e.x = this.width / 2
                e.y = this.height / 2
                e.radius = this.mainRadius + (index - this.arcs.length / 2) * this.deltaRadius
            })
        }

        // refresh
        this.drawUpdate()
    }

    update() {
        if (!super.update()) return
        this.drawUpdate()
    }

    drawUpdate() {
        this.clear()

        // style
        this.context.lineCap = 'round'
        this.context.strokeStyle = this.params.color
        this.context.lineWidth = this.params['line-width']

        // draw
        this.drawClockGraduations()
    }

    drawClockGraduations() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
    
        this.drawGraduation(60, this.mainRadius, hours, 'hours');
    
        this.drawGraduation(60, this.mainRadius * 1.2, minutes, 'minutes');
    
        this.drawGraduation(60, this.mainRadius * 1.4, seconds, 'seconds');
    }


    drawGraduation(nGradation, radius, currentTime, timeType) {
        for (let i = 0; i < nGradation; i++) {
            // Calculer l'angle pour les heures
            let angle;
            if (timeType === 'hours') {
                // Pour les heures, chaque graduation représente une minute
                // Donc, l'angle est calculé en divisant le cercle complet (2π radians) par 60
                // et en ajustant l'angle en fonction de l'heure actuelle
                // Ajouter 5 à l'heure actuelle pour la représenter à 5 graduations devant
                angle = ((i + (currentTime + 5) * 60) / 60) * 2 * Math.PI - Math.PI / 2;
            } else {
                // Pour les minutes et les secondes, utiliser la formule originale
                angle = 2 * Math.PI * i / nGradation - Math.PI / 2;
            }
    
            let length = radius * 0.05; // Longueur de la graduation par défaut
            let lineWidth = this.params['line-width']; // Épaisseur de la ligne par défaut
    
            // Augmenter la taille et l'épaisseur des graduations toutes les 5 graduations
            if (i % 5 === 0) {
                length *= 2; // Double la longueur
                lineWidth *= 2; // Double l'épaisseur
            }
    
            // Réduire le rayon pour les graduations toutes les 5
            let adjustedRadius = radius;
            if (i % 5 === 0) {
                adjustedRadius *= 0.98; // Réduire le rayon pour les graduations toutes les 5
            }
    
            const x = this.width / 2 + adjustedRadius * Math.cos(angle);
            const y = this.height / 2 + adjustedRadius * Math.sin(angle);
    
            // Changer la couleur des graduations en fonction de leur position relative à l'heure actuelle
            let color = this.params.color; // Couleur par défaut
            if (timeType === 'hours' && i < currentTime) {
                color = "#00ff00"; // Vert pour les graduations avant l'heure actuelle
            } else if (timeType === 'minutes' && i < currentTime) {
                color = "#0000ff"; // Bleu pour les graduations avant la minute actuelle
            } else if (timeType === 'seconds' && i < currentTime) {
                color = "#ff0000"; // Rouge pour les graduations avant la seconde actuelle
            } else if (i === currentTime) {
                // Couleur spécifique pour l'heure, la minute ou la seconde actuelle
                color = "#FFFF00"; // Jaune fluo pour l'heure, la minute ou la seconde actuelle
            }
    
            drawLine(this.context, x, y, length, angle, color, lineWidth);
        }
    }
}