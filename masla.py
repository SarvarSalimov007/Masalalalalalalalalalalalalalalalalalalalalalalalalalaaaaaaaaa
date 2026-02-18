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




