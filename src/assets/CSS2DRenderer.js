class CSS2DObject extends THREE.Object3D {
    constructor(element) {
        super();
        
        this.element = element;
        this.element.style.position = "absolute";
        this.element.style.pointerEvents = "auto";
        this.element.style.userSelect = "none";
        
        // 标记为 CSS2DObject 类型（用于渲染器识别）
        this.isCSS2DObject = true;
    }
    
    copy(source, recursive) {
        super.copy(source, recursive);
        this.element = source.element.cloneNode(true);
        return this;
    }
}

class CSS2DRenderer {
    constructor() {
        this.domElement = document.createElement("div");
        this.domElement.style.overflow = "hidden";
        this._width = 0;
        this._height = 0;
        this._widthHalf = 0;
        this._heightHalf = 0;
        this._cache = { objects: new WeakMap() };
    }

    setSize(width, height) {
        this._width = width;
        this._height = height;
        this._widthHalf = this._width / 2;
        this._heightHalf = this._height / 2;
        this.domElement.style.width = width + "px";
        this.domElement.style.height = height + "px";
    }

    render(scene, camera) {
        const vector = new THREE.Vector3();
        const viewMatrix = camera.matrixWorldInverse;
        const projectionMatrix = camera.projectionMatrix;

        const renderObject = (object) => {
            // 检查是否为 CSS2DObject
            if (object.isCSS2DObject) {
                // 确保对象有 matrixWorld
                object.updateMatrixWorld();
                
                vector.setFromMatrixPosition(object.matrixWorld);
                vector.applyMatrix4(viewMatrix);
                vector.applyMatrix4(projectionMatrix);

                const element = object.element;
                
                // 检查是否在视锥体内
                if (vector.z > -1 && vector.z < 1) {
                    element.style.display = "";
                    
                    // 计算屏幕坐标
                    const x = (vector.x * this._widthHalf) + this._widthHalf;
                    const y = -(vector.y * this._heightHalf) + this._heightHalf;
                    
                    element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
                    
                    // 设置 z-index 以实现正确的深度排序
                    element.style.zIndex = Math.floor((1 - vector.z) / 2 * 100000);
                } else {
                    element.style.display = "none";
                }

                // 将元素添加到 DOM（如果还没有）
                if (!this._cache.objects.has(object)) {
                    this.domElement.appendChild(element);
                    this._cache.objects.set(object, {});
                }
            }

            // 递归渲染子对象
            if (object.children && object.children.length > 0) {
                for (let i = 0; i < object.children.length; i++) {
                    renderObject(object.children[i]);
                }
            }
        };

        // 开始渲染场景
        renderObject(scene);
    }
}

if (typeof window !== "undefined") {
    window.CSS2DObject = CSS2DObject;
    window.CSS2DRenderer = CSS2DRenderer;
}

if (typeof THREE !== "undefined") {
    THREE.CSS2DObject = CSS2DObject;
    THREE.CSS2DRenderer = CSS2DRenderer;
}