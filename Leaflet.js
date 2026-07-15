// แก้ไขฟังก์ชันดึงข้อมูลให้รองรับการเปิดไฟล์จากเครื่องโดยตรง
function loadSafetyMap() {
    fetch('https://sa-projectxz.onrender.com/api/incidents')
        .then(res => res.json())
        .then(data => {
            // เคลียร์ marker หรือวงกลมเก่าตามปกติ...

            data.forEach(item => {
                let zoneColor = item.risk_level === 'Red' ? '#ff0000' : '#ffcc00';
                
                // สร้างวงกลม
                let circle = L.circle([item.latitude, item.longitude], {
                    color: zoneColor,
                    fillColor: zoneColor,
                    fillOpacity: 0.3,
                    radius: 30
                }).addTo(map);

                // 🔥 เปลี่ยนจาก Popup เป็นการคลิกแล้วเปิดกล่อง Feed ด้านข้าง
                circle.on('click', function() {
                    showIncidentFeed(item, data); 
                });
            });
        })
        .catch(err => console.error('โหลดข้อมูลล้มเหลว:', err));
}

// 🔥 ฟังก์ชันจัดการแสดงผลข้อมูลในกล่อง Feed
function showIncidentFeed(clickedItem, allData) {
    const panel = document.getElementById('incidentFeedPanel');
    const content = document.getElementById('feedContent');
    const title = document.getElementById('feedTitle');
    
    // ตั้งชื่อหัวข้อตามประเภทภัย
    title.innerHTML = `🚨 Area: #${clickedItem.hazard_type}`;
    
    // กรองหาข้อมูลที่อยู่พิกัดเดียวกัน (กรณีที่มีการกดซ้อนทับกันหลายคน สีเข้มๆ)
    const recordsInThisArea = allData.filter(info => 
        info.latitude === clickedItem.latitude && info.longitude === clickedItem.longitude
    );

    // ล้างข้อมูลเก่าในกล่องออกก่อน
    content.innerHTML = '';

    // วนลูปสร้างรายการการ์ดข้อมูลคนที่แจ้งเหตุเข้ามาในพิกัดนี้
    recordsInThisArea.forEach(info => {
        // จัดฟอร์แมตวันที่และเวลา (หากใน DB เก็บเป็น timestamp)
        let reportDate = info.created_at ? new Date(info.created_at).toLocaleString('th-TH') : 'ไม่ระบุวันเวลา';

        content.innerHTML += `
            <div class="feed-item">
                <b>👤 ผู้แจ้ง:</b> ${info.user_alias || 'ไม่ประสงค์ออกนาม'}<br>
                <b>📝 รายละเอียด:</b> ${info.description || 'ไม่มีรายละเอียด'}<br>
                <small style="color: #888;">📅 ${reportDate}</small>
            </div>
        `;
    });

    // สั่งเปิดกล่อง UI ขึ้นมาโชว์
    panel.style.display = 'flex';
}

// ฟังก์ชันสำหรับกดปุ่มกากบาทเพื่อปิดกล่อง
function closeFeedPanel() {
    document.getElementById('incidentFeedPanel').style.display = 'none';
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