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
##1-masala
# def choyxona_qaytimi(hisob,tolangan):
#     if tolangan < hisob:
#         return "Siz yetarli to'lovni to'lamadingiz!"
#     else:
#         return tolangan % hisob
# print(choyxona_qaytimi(85_000,100_000))
# print(choyxona_qaytimi(120_000,100_000))
#####################################
#####################################
#####################################
##2-masala
# def yugurish_statistikasi(masofalar,maqsad_km):
#     bajarilgan = 0 
#     if m in masofalar:
#         if m >= maqsad_km:
#             bajarilgan += 1
#     jami_kun = len(masofalar)
#     bajarilmagan = jami_kun - bajarilgan

#     eng_uzoq = max(masofalar) if masofalar else 0
#     ortalama = sum(masofalar) / jami_kun if jami_kun > 0 else 0

#     return {
#         "Bajarilgan_Kunlar",bajarilgan,
#         "Bajarilmagan_Kunlar",bajarilmagan,
#         "Eng_Uzoq",eng_uzoq,
#         "O'rtalama",ortalama,
#     }