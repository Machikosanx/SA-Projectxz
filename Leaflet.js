// แก้ไขฟังก์ชันดึงข้อมูลให้รองรับการเปิดไฟล์จากเครื่องโดยตรง
function loadSafetyMap() {
    // 1. สร้างกลุ่ม Layer ของวงกลมไว้ล่วงหน้า (เพื่อเอาไว้สั่งหดขนาดตอนซูม)
    if (!window.circleLayerGroup) {
        window.circleLayerGroup = L.layerGroup().addTo(map);
    }

    fetch('https://sa-projectxz.onrender.com/api/incidents')
        .then(res => {
            if(!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            window.circleLayerGroup.clearLayers(); // เคลียร์ของเก่าออกก่อน
            
            data.forEach(item => {
                let zoneColor = item.risk_level === 'Red' ? '#ff0000' : '#ffcc00';
                
                // คำนวณรัศมีเริ่มต้นตามระดับการซูมปัจจุบัน
                const currentZoom = map.getZoom();
                let initialRadius = currentZoom >= 17 ? 15 : 30; // ถ้าซูมใกล้มากให้เหลือ 15 เมตรพอดีซอย

                let circle = L.circle([item.latitude, item.longitude], {
                    color: zoneColor,
                    fillColor: zoneColor,
                    fillOpacity: 0.3,
                    radius: initialRadius // ใช้ค่ารัศมีที่คำนวณแล้ว
                }).bindPopup(`
                    <div style="color: black; font-family: Tahoma; font-size: 14px;">
                        <b>🚨 #${item.hazard_type}</b><br>
                        <b>รายละเอียด:</b> ${item.description}<br>
                        <small style="color: gray;">ผู้แจ้งเหตุ: ${item.user_alias}</small>
                    </div>
                `);

                window.circleLayerGroup.addLayer(circle);
            });
        })
        .catch(err => {
            console.log('โหมดออฟไลน์: กำลังโหลดแผนที่ฐานเริ่มต้น...');
        });
}

// 2. 🔥 ดักจับเหตุการณ์ตอนผู้ใช้ซูมเข้า-ออก (Zoom) เพื่อสั่งให้วงกลมหด/ขยายตามความเหมาะสม
if (typeof map !== 'undefined') {
    map.on('zoomend', function() {
        if (window.circleLayerGroup) {
            const currentZoom = map.getZoom();
            
            // สูตรคำนวณ: ยิ่งซูมเข้าลึก (เลขซูมเยอะ) ให้รัศมีเมตรยิ่งน้อยลง
            let newRadius = 30;
            if (currentZoom >= 18) newRadius = 10;     // ซูมมิดซอย วงกลมเหลือ 10 เมตร (เล็กจิ๋วไม่บังถนน)
            else if (currentZoom >= 17) newRadius = 20; // ซูมปานกลางในซอย วงเหลือ 20 เมตร
            else if (currentZoom >= 15) newRadius = 40; 
            else newRadius = 100;                       // ซูมออกไปไกลๆ ให้วงใหญ่ขึ้นจะได้มองเห็น

            window.circleLayerGroup.eachLayer(function(layer) {
                if (layer instanceof L.Circle) {
                    layer.setRadius(newRadius);
                }
            });
        }
    });
}