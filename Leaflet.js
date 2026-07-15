// แก้ไขฟังก์ชันดึงข้อมูลให้รองรับการเปิดไฟล์จากเครื่องโดยตรง
        function loadSafetyMap() {
            fetch('https://sa-projectxz.onrender.com/api/incidents')
                .then(res => {
                    if(!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(data => {
                    data.forEach(item => {
                        let zoneColor = item.risk_level === 'Red' ? '#ff0000' : '#ffcc00';
                        
                        L.circle([item.latitude, item.longitude], {
                            color: zoneColor,
                            fillColor: zoneColor,
                            fillOpacity: 0.4,
                            radius: 100
                        }).addTo(map).bindPopup(`
                            <div style="color: black; font-family: Tahoma; font-size: 14px;">
                                <b>🚨 #${item.hazard_type}</b><br>
                                <b>รายละเอียด:</b> ${item.description}<br>
                                <small style="color: gray;">ผู้แจ้งเหตุ: ${item.user_alias}</small>
                            </div>
                        `);
                    });
                })
                .catch(err => {
                    console.log('โหมดออฟไลน์: กำลังโหลดแผนที่ฐานเริ่มต้น...');
                    // หากยังไม่ได้เปิดเซิร์ฟเวอร์หลังบ้าน ให้แผนที่ยังทำงานได้อยู่ ไม่ขาวโพลน
                });
        }
