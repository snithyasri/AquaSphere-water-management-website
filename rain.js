document.addEventListener("DOMContentLoaded", function () {
    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.id = "rain-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "-1"; // Behind everything
    // Dark background for neon effect
    canvas.style.background = "linear-gradient(to bottom, #0f172a, #1e293b)";
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");
    let width, height;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    class Drop {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * -height;
            this.speed = Math.random() * 5 + 4;
            this.length = Math.random() * 20 + 10;
            // Cyan/Blue Neon Glow
            this.color = `hsl(${Math.random() * 40 + 180}, 100%, 70%)`;
        }

        update() {
            this.y += this.speed;
            if (this.y > height) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.length);

            // Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    const maxDrops = 100;
    const drops = [];
    for (let i = 0; i < maxDrops; i++) {
        drops.push(new Drop());
    }

    function animate() {
        // Clear with trails
        ctx.fillStyle = "rgba(15, 23, 42, 0.2)";
        ctx.fillRect(0, 0, width, height);

        drops.forEach(drop => {
            drop.update();
            drop.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
});
