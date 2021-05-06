if(${ENABLE_COVERAGE_WITH_LLVM})
  # specific flags to build the covered project. Enable source based Coverage
  # see:
  # https://releases.llvm.org/10.0.0/tools/clang/docs/SourceBasedCodeCoverage.html
  target_compile_options(PartiallyCoveredLib PRIVATE
                         -fprofile-instr-generate -fcoverage-mapping)
  target_link_options(PartiallyCoveredLib PRIVATE
                       -fprofile-instr-generate -fcoverage-mapping)

  # Useful variables used later, specific to llvm tools path and output
  # directory
  get_filename_component(llvmBinPath ${CMAKE_CXX_COMPILER} DIRECTORY)
  set(llvmProfData ${llvmBinPath}/llvm-profdata)
  set(llvmCov ${llvmBinPath}/llvm-cov)

  # An internal custom command used as dependency of exposed targets to
  # generate coverage data
  add_custom_command(OUTPUT default.profdata
                     DEPENDS .testSuite.executed
                     COMMAND ${llvmProfData}
                       ARGS merge 
                       -sparse default.profraw
                       -o default.profdata)

  # An internal command used as dependency for exposed targets. Ensures that
  # the test suite has been executed with latest modifications and latest
  # coverage data.
  add_custom_command(OUTPUT .testSuite.executed
                     DEPENDS PartiallyCoveredLib PartiallyCoveredTests
                     COMMAND ${CMAKE_COMMAND}
                       ARGS -E copy $<TARGET_FILE:PartiallyCoveredLib> $<TARGET_FILE_DIR:PartiallyCoveredTests>
                     COMMAND $<TARGET_FILE:PartiallyCoveredTests>
                     COMMAND ${CMAKE_COMMAND}
                       ARGS -E touch .testSuite.executed
                     VERBATIM
                     USES_TERMINAL)

  # A target to generate detailed coverage information in json format. To get
  # help on how to exploit it, see:
  # https://stackoverflow.com/questions/56013927/how-to-read-llvm-cov-json-format
  # https://llvm.org/doxygen/structllvm_1_1coverage_1_1CoverageSegment.html
  # https://llvm.org/doxygen/structllvm_1_1coverage_1_1CounterMappingRegion.html
  add_custom_target(generateCoverageInfoJsonFile
                    DEPENDS default.covdata.json)

  # An internal command used to generate detailed coverage information in a
  # file
  add_custom_command(OUTPUT default.covdata.json
                     DEPENDS default.profdata
                     COMMAND ${llvmCov}
                       ARGS export --format=text
                       $<TARGET_FILE:PartiallyCoveredLib>
                       --instr-profile=default.profdata
                       > default.covdata.json
                     VERBATIM
                     USES_TERMINAL)
endif()
