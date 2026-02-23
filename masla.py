#####################################
#####################################
#####################################
# def internet_kunlar(mb,kunlik_mb):
#     if kunlik_mb <= 0:
#         return "Noto'g'ri qiymat!"
#     else:
#         return mb // kunlik_mb
# print(internet_kunlar(3000,500))
# print(internet_kunlar(1500,0))
#####################################
#####################################
#####################################
##1-masala##Bank xisobi
# class Bankhisobi:
#     def __init__(self,egasi,boshlangich_balans):
#         self.__egasi = egasi
#         self.__balans = boshlangich_balans
#     def get_egasi(self):
#         return self.__egasi
#     def get_balans(self):
#         return self.__balans
#     def pulqosh(self,miqdor):
#         if miqdor < 0 or miqdor == 0:
#             return "Noto'g'ri qiymat!"
#         else:
#             self.__balans += miqdor
#             return self.__balans
#     def pulyech(self,miqdor):
#         if miqdor < 0 or miqdor == 0:
#             return "Noto'g'ri qiymat!"
#         elif miqdor > self.__balans:
#             return "Mablag' yetarli emas!"
#         else:
#             self.__balans -= miqdor
#             return self.__balans
  
# hisob = Bankhisobi("ali",500_000_000)
# print("Karta egasi: ",hisob.get_egasi())
# print("Karta balansi: ",hisob.get_balans())
# hisob.pulqosh(200_000_000)
# print("Karta balansi: ",hisob.get_balans())
# hisob.pulyech(100_000_000)
# print("Karta balansi: ",hisob.get_balans())
# print(hisob.__balans)
##2-masala##parol boshqruvchisi
# class Foydalanuvchi:
#     def __init__(self,ism,parol):
#         self.ism = ism
#         self.__parol = parol
#     def get_ism(self):
#         return self.ism
#     def get_parol(self):
#         return self.__parol
#     def paroltekshir(self,kiritilgan_parol):
#         if kiritilgan_parol == self.__parol:
#             return True
#         else:
#             return False
#     def parolozgartir(self,eski_parol,yangi_parol):
#         if eski_parol != self.__parol:
#             return "Parol Noto'g'ri!",False
#         elif len(yangi_parol) < 6:
#             return "Parol kamida 6 ta belgidan iborat bo'lishi kerak!",False
#         else:
#             self.__parol = yangi_parol
#             return "Parol o'zgartirildi!",True
# user = Foydalanuvchi("Sardor","maxfiy123")
# print(user.get_ism())
# print(user.paroltekshir("noto'g'ri"))
# print(user.paroltekshir("maxfiy123"))
# print(user.parolozgartir("xato","yangi456"))
# print(user.parolozgartir("maxfiy123","123"))
# print(user.paroltekshir("maxfiy123"))
# print(user.paroltekshir("yangi456"))
##3-masala##Talaba baholari jurnali
# class Talaba:
#     def __init__(self,ism,fan):
#         self.__ism = ism
#         self.__fan = fan
#         self.__baholar = []
#     def get_ism(self):
#         return self.__ism
#     def get_fan(self):
#         return self.__fan
#     def get_baholar(self):
#         return self.__baholar
#     def baho_qosh(self,baho):
#         if baho < 0 or baho > 100:
#             return "Baho 0 dan 100 balgacha bo'lishi kerak!"
#         else:
#             self.__baholar.append(baho)
#         return "Baho qoshildi"
#     def get_baho(self):
#         return self.__baholar.copy()
#     def ortacha_baho(self):
#         baholar = self.get_baho()
#         if len(baholar) == 0:
#             return "Baholar yo'q!",None
#         else:
#             return sum(baholar) / len(baholar)
# talaba = Talaba('Nodira',"Matematika")
# print(talaba.get_ism())
# print(talaba.get_fan())
# talaba.baho_qosh(85)
# talaba.baho_qosh(92)
# talaba.baho_qosh(78)
# talaba.baho_qosh(150)
# print(talaba.get_baholar())
# print(talaba.ortacha_baho())
# baholar = talaba.get_baholar()
# baholar.append(999)
# print(talaba.get_baholar())
##4-masala##Harorat sensori
class Harorat_Sensori:
    def __init__(self,sensor_id,joylashuv):
        self.__sensor_id = sensor_id
        self.__joylashuv = joylashuv
        self.__olchovlar = {}
        self.__min_harorat = -50
        self.__max_harorat = 150                                
    def get_sensor_id(self):
        return self.__sensor_id
    def get_joylashuv(self):
        return self.__joylashuv
    def get_olchovlar(self):
        return self.__olchovlar
    def get_min_harorat(self):
        return self.__min_harorat
    def get_max_harorat(self):
        return self.__max_harorat
    def olchov_qosh(self,harorat,vaqt):
        if harorat < self.__min_harorat or harorat > self.__max_harorat:
            return "Xato!: Harorat -50 dan 150 gacha bo'lishi kerak!"
        else:
            self.__olchovlar[vaqt] = harorat
            return "Olchov qoshildi"
    def oxirgi_olchov(self):
        if len(self.__olchovlar) == 0:
            return "Olchovlar yo'q!"
        else:
            oxirgi_vaqt = list(self.__olchovlar.keys())[-1]
            return f"{oxirgi_vaqt}: {self.__olchovlar[oxirgi_vaqt]}"
    def ortacha_harorat(self):
        if not self.__olchovlar:
            return 0
        return sum(self.__olchovlar.values()) / len(self.__olchovlar)
    def olchovlar_soni(self):
        return len(self.__olchovlar)
    def hisobot(self):
        return f"Sensor ID: {self.__sensor_id}\nJoylashuv: {self.__joylashuv}\nOlchovlar: {self.__olchovlar}\nOrtacha harorat: {self.ortacha_harorat()}"
sensor = Harorat_Sensori("S-001", "1-sex")
sensor.olchov_qosh(22.5,"08:00")
sensor.olchov_qosh(23.0,"12:00")
sensor.olchov_qosh(24.5,"18:00")
sensor.olchov_qosh(25.0,"20:00")
print(f"Oxirgi o'lchov: {sensor.oxirgi_olchov()}")
print(f"O'rtacha harorat: {sensor.ortacha_harorat()}")
print(f"O'lchovlar soni: {sensor.olchovlar_soni()}")
print(sensor.hisobot())