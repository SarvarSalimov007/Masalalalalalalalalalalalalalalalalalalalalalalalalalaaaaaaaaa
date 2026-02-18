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
class Foydalanuvchi:
    def __init__(self,ism,parol):
        self.ism = ism
        self.__parol = parol
    def get_ism(self):
        return self.ism
    def get_parol(self):
        return self.__parol
    def paroltekshir(self,kiritilgan_parol):
        if kiritilgan_parol == self.__parol:
            return True
        else:
            return False
    def parolozgartir(self,eski_parol,yangi_parol):
        if eski_parol != self.__parol:
            return "Parol Noto'g'ri!",False
        elif len(yangi_parol) < 6:
            return "Parol kamida 6 ta belgidan iborat bo'lishi kerak!",False
        else:
            self.__parol = yangi_parol
            return "Parol o'zgartirildi!",True
user = Foydalanuvchi("Sardor","maxfiy123")
print(user.get_ism())
print(user.paroltekshir("noto'g'ri"))
print(user.paroltekshir("maxfiy123"))
print(user.parolozgartir("xato","yangi456"))
print(user.parolozgartir("maxfiy123","123"))
print(user.paroltekshir("maxfiy123"))
print(user.paroltekshir("yangi456"))



