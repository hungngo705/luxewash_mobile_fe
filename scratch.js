const fs = require('fs');
const path = 'src/app/vehicles/add-vehicle.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace state
content = content.replace(
  /const \[otherCarModelText, setOtherCarModelText\] = useState\(""\);/,
  `const [otherBrand, setOtherBrand] = useState("");
  const [otherModelName, setOtherModelName] = useState("");
  const [userNote, setUserNote] = useState("");`
);

// 2. Replace state reset
content = content.replace(
  /setOtherCarModelText\(""\);/g,
  `setOtherBrand("");
    setOtherModelName("");
    setUserNote("");`
);

// 3. Update loadTypes to inject "Khác"
content = content.replace(
  /const loadTypes = async \(\) => {[\s\S]*?loadTypes\(\);\n  }, \[\]\);/,
  `const loadTypes = async () => {
      try {
        const res = await vehicleService.getVehicleTypes();
        if (res.statusCode === 200 && res.data) {
          const types = [...res.data];
          if (!types.some((t) => t.name.toLowerCase() === "khác" || t.name.toLowerCase() === "other")) {
            types.push({ id: 9999, name: "Khác", description: "Loại xe khác", baseWeight: 1 });
          }
          setVehicleTypes(types);
          if (types.length > 0) {
            setSelectedTypeId(types[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load vehicle types:", e);
        const fallback: VehicleType[] = [
          { id: 1, name: "Sedan" },
          { id: 2, name: "SUV" },
          { id: 3, name: "Pickup" },
          { id: 9999, name: "Khác" },
        ];
        setVehicleTypes(fallback);
        setSelectedTypeId(1);
      } finally {
        setLoadingTypes(false);
      }
    };
    loadTypes();
  }, []);`
);

// 4. Update handleSubmit
content = content.replace(
  /const handleSubmit = async \(\) => {[\s\S]*?  const isSubmitDisabled =/m,
  `const handleSubmit = async () => {
    if (!licensePlate.trim()) {
      alert("Vui lòng nhập biển số xe");
      return;
    }
    if (!isOtherModelFreeText && !selectedCarModel) {
      alert("Vui lòng chọn mẫu xe");
      return;
    }
    if (isOtherModelFreeText && (!otherBrand.trim() || !otherModelName.trim())) {
      alert("Vui lòng nhập đầy đủ hãng xe và tên mẫu xe");
      return;
    }
    if (!selectedTypeId) {
      alert("Vui lòng chọn loại xe");
      return;
    }
    const isOtherVehicleType = selectedType?.name === "Khác" || selectedType?.name === "Other";
    if (isOtherVehicleType && !userNote.trim()) {
      alert("Vui lòng nhập tên loại xe thực tế của bạn");
      return;
    }
    if (!registrationPhoto) {
      alert("Vui lòng thêm ảnh thực tế của xe");
      return;
    }

    setIsSubmitting(true);

    try {
      let carModelId: number | undefined;

      if (isOtherModelFreeText) {
        const requestRes = await vehicleService.requestCarModel({
          brand: otherBrand.trim(),
          name: otherModelName.trim(),
          vehicleTypeId: selectedTypeId,
        });
        if (requestRes.statusCode === 200 && requestRes.data != null) {
          carModelId = requestRes.data;
        } else {
          alert(requestRes.message || "Không thể gửi yêu cầu thêm mẫu xe.");
          return;
        }
      } else if (selectedCarModel) {
        carModelId = selectedCarModel.id;
      }

      const formData = new FormData();
      formData.append("licensePlate", licensePlate);
      formData.append("vehicleTypeId", String(selectedTypeId!));

      if (carModelId != null) {
        formData.append("carModelId", String(carModelId));
      }

      if (isOtherVehicleType && userNote.trim()) {
        formData.append("userNote", userNote.trim());
      }

      const file = getFileObject();
      formData.append("PhotoFile", file as Blob);

      const { accessToken } = await getStoredTokens();
      const response = await expoFetch(\`\${BASE_URL}/vehicles\`, {
        method: "POST",
        headers: accessToken ? { Authorization: \`Bearer \${accessToken}\` } : {},
        body: formData,
      });

      if (response.ok) {
        const successMessage = isOtherModelFreeText
          ? "Xe đã được thêm vào tài khoản. Mẫu xe mới của bạn đang chờ duyệt."
          : "Xe đã được thêm vào tài khoản";
        confirm({
          title: "Thành công",
          message: successMessage,
          confirmText: "Xác nhận",
          showCancel: false,
          onConfirm: async () => {
            await refreshProfile();
            router.replace("/vehicles");
          },
        });
      } else {
        const errorData = response.json
          ? await response.json().catch(() => null)
          : null;
        const errorMessage =
          errorData?.message || \`Lỗi \${response.status}: Không thể thêm xe.\`;
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Add vehicle error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi thêm xe. Vui lòng thử lại.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOtherVehicleType = selectedType?.name === "Khác" || selectedType?.name === "Other";

  const isSubmitDisabled =`
);

// 5. Update isSubmitDisabled dependencies
content = content.replace(
  /!selectedTypeId \|\|\n    !registrationPhoto;/g,
  `!selectedTypeId ||
    (isOtherVehicleType && !userNote.trim()) ||
    !registrationPhoto;`
);

content = content.replace(
  /\(\!selectedCarModel && \!isOtherModelFreeText\) \|\|\n    \(\!otherCarModelText\.trim\(\)\)/g,
  `(!selectedCarModel && !isOtherModelFreeText) ||
    (isOtherModelFreeText && (!otherBrand.trim() || !otherModelName.trim()))`
);

// 6. Update UI for Car Models Free Text
content = content.replace(
  /\{\/\* Free Text Input \*\/\}([\s\S]*?)<\/View>\n                \)\}/g,
  `{/* Free Text Input */}
                {isOtherModelFreeText && (
                  <View style={styles.otherModelFields}>
                    <View style={styles.dongXeInfoBanner}>
                      <Feather
                        name="info"
                        size={14}
                        color={LuxeColors.primaryContainer}
                      />
                      <Text style={styles.dongXeInfoText}>
                        Mẫu xe mới sẽ được gửi chờ duyệt. Bạn vẫn có thể thêm xe ngay.
                      </Text>
                    </View>
                    <Text style={styles.otherFieldLabel}>Hãng xe *</Text>
                    <TextInput
                      style={styles.inputModel}
                      value={otherBrand}
                      onChangeText={setOtherBrand}
                      placeholder="VD: Toyota, Honda, VinFast..."
                      placeholderTextColor={LuxeColors.onSurfaceVariant}
                      maxLength={50}
                      autoCapitalize="words"
                    />
                    <Text style={styles.otherFieldLabel}>Tên mẫu xe *</Text>
                    <TextInput
                      style={styles.inputModel}
                      value={otherModelName}
                      onChangeText={setOtherModelName}
                      placeholder="VD: Camry, Civic, VF9..."
                      placeholderTextColor={LuxeColors.onSurfaceVariant}
                      maxLength={50}
                      autoCapitalize="words"
                    />
                  </View>
                )}`
);

// 7. Update UI for Vehicle Type Khác (userNote)
content = content.replace(
  /                  <\/View>\n                \)\}\n              <\/>\n            \)\}/g,
  `                  </View>
                )}
                {isOtherVehicleType && (
                  <View style={styles.otherModelFields}>
                    <View style={styles.dongXeInfoBanner}>
                      <Feather
                        name="info"
                        size={14}
                        color={LuxeColors.primaryContainer}
                      />
                      <Text style={styles.dongXeInfoText}>
                        Vui lòng nhập tên loại xe để chúng tôi cập nhật vào hệ thống.
                      </Text>
                    </View>
                    <Text style={styles.otherFieldLabel}>Tên loại xe *</Text>
                    <TextInput
                      style={styles.inputModel}
                      value={userNote}
                      onChangeText={setUserNote}
                      placeholder="VD: Xe tải, Xe bồn..."
                      placeholderTextColor={LuxeColors.onSurfaceVariant}
                      maxLength={100}
                      autoCapitalize="words"
                    />
                  </View>
                )}
              </>
            )}`
);

// 8. Add styles
content = content.replace(
  /  submitBtnText: \{[\s\S]*?\},/g,
  `  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1,
  },
  otherModelFields: {
    gap: LuxeSpacing.sm,
    marginTop: LuxeSpacing.xs,
  },
  otherFieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: LuxeColors.onSurfaceVariant,
    marginTop: LuxeSpacing.xs,
  },
  khacDivider: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: LuxeSpacing.md,
    paddingTop: LuxeSpacing.sm,
    paddingBottom: 2,
    gap: 6,
  },
  khacDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: LuxeColors.outlineVariant,
  },
  khacDividerText: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dongXeInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4aa9d71a",
    borderRadius: LuxeBorderRadius.sm,
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.sm,
    marginTop: LuxeSpacing.xs,
  },
  dongXeInfoText: {
    flex: 1,
    fontSize: 13,
    color: LuxeColors.primaryContainer,
    fontWeight: "500",
  },`
);

fs.writeFileSync(path, content);
console.log("Transformation completed.");
