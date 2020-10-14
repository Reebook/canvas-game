
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight
const scoreEL = document.querySelector('#scoreEL')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEL = document.querySelector('#modalEL')
const scoreFinal = document.querySelector('#scoreFinal')
console.log(modalEL)



class Player{
    constructor(x,y,radius,color){
        this.x = x
        this.y = y
        this.radius = radius 
        this.color = color
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius
            ,0, Math.PI * 2,false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}

class Proyectile{

    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius 
        this.color = color
        this.velocity = velocity
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius
            ,0, Math.PI * 2,false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy{

    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius 
        this.color = color
        this.velocity = velocity
    }

    draw(){        
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius
            ,0, Math.PI * 2,false)
        ctx.fillStyle = this.color
        ctx.fill()        
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        
    }
}

const fritcion = 0.97

class Particle{

    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius 
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw(){
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius
            ,0, Math.PI * 2,false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }

    update(){
        this.draw()
        this.velocity.x *= fritcion
         this.velocity.y *= fritcion
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}


const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x,y,15,"white")



let proyectiles = []
let enemies = []
let particles = []

function init(){
    player = new Player(x,y,15,"white")
    proyectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEL.innerHTML = score
    scoreFinal.innerHTML = score
}
function spawnEnemies(){
    setInterval(()=>{
        const radius = Math.random() * (30-4) + 4
        let x
        let y
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ?  0-radius : canvas.width + radius
            y = Math.random() * canvas.height
        }else{
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ?  0-radius : canvas.height + radius
        }
       
        const color = `hsl(${Math.random() * 360},50%,50%)`
        
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x,y,radius,color,velocity))
    },1000)
}
let animationId
let score = 0
function animate(){
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    ctx.fillRect(0,0,canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle,index)=>{
        if(particle.alpha <= 0){
            particles.splice(index,1)
        }else{
            particle.update()    
        }
        
    })
    proyectiles.forEach((proyectile, index) => {
        proyectile.update()
        if(proyectile.x + proyectile.radius < 0 ||
            proyectile.x - proyectile.radius > canvas.width || 
            proyectile.y + proyectile.radius < 0 ||
            proyectile.y - proyectile.radius > canvas.height){
                setTimeout(() =>{                    
                    proyectiles.splice(index,1)
                },0)
            }
    })



    enemies.forEach((enemy, index) =>{
        enemy.update()
        const dist = Math.hypot(player.x - enemy.x,player.y -enemy.y)
        //EndGame
        if(dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId)
            scoreFinal.innerHTML = score
            modalEL.style.display = 'flex'

        }
        proyectiles.forEach((proyectile, proyectileIndex) => {
            const dist = Math.hypot(proyectile.x - enemy.x,proyectile.y -enemy.y)
            if(dist - enemy.radius - proyectile.radius < 1){
                
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle(proyectile.x, 
                            proyectile.y,
                            Math.random() * 2,
                            enemy.color,
                            {
                                x: Math.random()-0.5 * (Math.random() * 6),
                                y: Math.random()-0.5 * (Math.random() * 6)
                            }
                    ))
                    
                }

                if(enemy.radius-10 > 5){
                    score += 100
                    scoreEL.innerHTML = score
                    gsap.to(enemy,{
                        radius: enemy.radius -10
                    })
                    enemy.radius -= 10
                    
                    setTimeout(() =>{                    
                        proyectiles.splice(proyectileIndex,1)
                    },0)
                    
                }else{
                    score += 250
                    scoreEL.innerHTML = score
                    setTimeout(() =>{
                        enemies.splice(index,1)
                        proyectiles.splice(proyectileIndex,1)
                    },0)
                    
                }
            }
            
        })
    })

}
window.addEventListener('click',(event) =>{
    console.log(proyectiles)
    const angle = Math.atan2(event.clientY - canvas.height / 2,event.clientX - canvas.width / 2)
    const velocity = {x: Math.cos(angle) * 5, y: Math.sin(angle) * 5}
    proyectiles.push(proyectile = new Proyectile(canvas.width / 2,canvas.height / 2,5,'white',velocity))
})

startGameBtn.addEventListener('click',(event) => {
    init()
    spawnEnemies()
    animate()
    modalEL.style.display = 'none'
})

