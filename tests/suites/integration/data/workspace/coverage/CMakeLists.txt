if(${ENABLE_COVERAGE_WITH_LLVM})
  # specific flags to build the covered project. Enable source based Coverage
  # see:
  # https://releases.llvm.org/10.0.0/tools/clang/docs/SourceBasedCodeCoverage.html
  # TODO: notice multiple target usage here
  target_compile_options(PartiallyCoveredLib PRIVATE
                         -fprofile-instr-generate -fcoverage-mapping)
  target_link_options(PartiallyCoveredLib PRIVATE
                      -fprofile-instr-generate -fcoverage-mapping)
  target_compile_options(FullyCoveredLib PRIVATE
                         -fprofile-instr-generate -fcoverage-mapping)
  target_link_options(FullyCoveredLib PRIVATE
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
                       -sparse
                       # TODO: notice multiple target usage here
                       $<TARGET_NAME_IF_EXISTS:PartiallyCoveredTests>.profraw
                       $<TARGET_NAME_IF_EXISTS:FullyCoveredTests>.profraw
                       -o default.profdata)

  # An internal command used as dependency for exposed targets. Ensures that
  # the test suite has been executed with latest modifications and latest
  # coverage data.
  add_custom_command(OUTPUT .testSuite.executed
                     DEPENDS
                       # TODO: notice multiple target usage here
                       PartiallyCoveredLib PartiallyCoveredTests
                       FullyCoveredLib FullyCoveredTests

                     # TODO: notice multiple target usage here
                     # TODO: possible one to many and many to one mapping
                     #       between test suites and production code
                     COMMAND ${CMAKE_COMMAND}
                       ARGS -E copy $<TARGET_FILE:PartiallyCoveredLib> $<TARGET_FILE_DIR:PartiallyCoveredTests>
                     COMMAND ${CMAKE_COMMAND}
                       ARGS -E copy $<TARGET_FILE:FullyCoveredLib> $<TARGET_FILE_DIR:FullyCoveredTests>

                     # TODO: notice multiple target usage here
                     COMMAND $<TARGET_FILE:PartiallyCoveredTests>
                     COMMAND ${CMAKE_COMMAND}
                       ARGS -E rename default.profraw $<TARGET_NAME_IF_EXISTS:PartiallyCoveredTests>.profraw
                     COMMAND $<TARGET_FILE:FullyCoveredTests>
                     COMMAND ${CMAKE_COMMAND}
                       ARGS -E rename default.profraw $<TARGET_NAME_IF_EXISTS:FullyCoveredTests>.profraw

                     COMMAND ${CMAKE_COMMAND}
                       ARGS -E touch .testSuite.executed
                     VERBATIM
                     USES_TERMINAL)

  # A target to generate detailed coverage information in json format. To get
  # help on how to exploit it, see:
  # https://stackoverflow.com/questions/56013927/how-to-read-llvm-cov-json-format
  # https://llvm.org/doxygen/structllvm_1_1coverage_1_1CoverageSegment.html
  # https://llvm.org/doxygen/structllvm_1_1coverage_1_1CounterMappingRegion.html
  add_custom_target(coverage
                    DEPENDS coverage.json)

  # An internal command used to generate detailed coverage information in a
  # file
  add_custom_command(OUTPUT coverage.json
                     DEPENDS default.profdata
                     COMMAND ${llvmCov}
                       ARGS export --format=text
                       # TODO: notice multiple target usage here
                       --object=$<TARGET_FILE:PartiallyCoveredLib>
                       --object=$<TARGET_FILE:FullyCoveredLib>
                       --instr-profile=default.profdata
                       > coverage.json
                     VERBATIM
                     USES_TERMINAL)
endif()
